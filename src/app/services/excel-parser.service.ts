import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { FileData } from '../models/candidate.model';
import {
  FILE_ERROR_KEYS,
  IFileParser,
  ProcessedRowData,
  SUPPORTED_FILE_TYPES
} from '../models/file-parser.model';
import { FileValidationService } from './file-validation.service';

/**
 * Parser específico para archivos Excel (.xlsx, .xls)
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelFileParser implements IFileParser {
  readonly supportedTypes = SUPPORTED_FILE_TYPES.EXCEL;

  constructor(private readonly validationService: FileValidationService) {}

  canParse(file: File): boolean {
    return this.supportedTypes.some(type =>
      file.name.toLowerCase().endsWith(type)
    );
  }

  parse(file: File): Observable<FileData> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const result = this.processExcelFile(e.target?.result as ArrayBuffer);
          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error(new Error(`${FILE_ERROR_KEYS.READ_ERROR}: ${error}`));
        }
      };

      reader.onerror = () => {
        observer.error(new Error(FILE_ERROR_KEYS.READ_ERROR));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private processExcelFile(buffer: ArrayBuffer): FileData {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Obtener datos como array de arrays
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Validar número de filas
    const rowValidation = this.validationService.validateRowCount(rawData.length);
    if (!rowValidation.isValid) {
      throw new Error(rowValidation.errors[0]);
    }

    // Intentar parsear como JSON con headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

    let processedData: ProcessedRowData;

    if (jsonData.length > 0) {
      // El archivo tiene headers válidos
      processedData = this.extractDataWithHeaders(jsonData[0], rawData[0]);
    } else {
      // El archivo no tiene headers o no son válidos
      processedData = this.extractDataWithoutHeaders(rawData[0]);
    }

    return this.validateAndConvertData(processedData);
  }

  private extractDataWithHeaders(jsonRow: any, rawRow: any[]): ProcessedRowData {
    // Verificar si tiene los headers esperados
    const hasValidHeaders = jsonRow.hasOwnProperty('seniority') &&
                           jsonRow.hasOwnProperty('yearsOfExperience') &&
                           jsonRow.hasOwnProperty('availability');

    if (hasValidHeaders) {
      return {
        seniority: jsonRow.seniority,
        yearsOfExperience: jsonRow.yearsOfExperience,
        availability: jsonRow.availability
      };
    }

    // Si no tiene headers válidos, tratar como datos sin header
    return this.extractDataWithoutHeaders(rawRow);
  }

  private extractDataWithoutHeaders(rawRow: any[]): ProcessedRowData {
    const columnValidation = this.validationService.validateColumnCount(rawRow.length);
    if (!columnValidation.isValid) {
      throw new Error(columnValidation.errors[0]);
    }

    return {
      seniority: rawRow[0],
      yearsOfExperience: rawRow[1],
      availability: rawRow[2]
    };
  }

  private validateAndConvertData(data: ProcessedRowData): FileData {
    // Normalizar datos
    const normalizedData = this.validationService.normalizeRowData(data);

    // Validar datos normalizados
    const validation = this.validationService.validateRowData(normalizedData);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    return {
      seniority: normalizedData.seniority as 'junior' | 'senior',
      yearsOfExperience: normalizedData.yearsOfExperience as number,
      availability: normalizedData.availability as boolean
    };
  }
}

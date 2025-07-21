import { Injectable, inject } from '@angular/core';
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
  private readonly validationService = inject(FileValidationService);

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


    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];


    const rowValidation = this.validationService.validateRowCount(rawData.length);
    if (!rowValidation.isValid) {
      throw new Error(rowValidation.errors[0]);
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    let processedData: ProcessedRowData;

    if (jsonData.length > 0) {
      processedData = this.extractDataWithHeaders(jsonData[0], rawData[0]);
    } else {
      processedData = this.extractDataWithoutHeaders(rawData[0]);
    }

    return this.validateAndConvertData(processedData);
  }

  private extractDataWithHeaders(jsonRow: Record<string, unknown>, rawRow: unknown[]): ProcessedRowData {
    const hasValidHeaders = Object.prototype.hasOwnProperty.call(jsonRow, 'seniority') &&
                           Object.prototype.hasOwnProperty.call(jsonRow, 'yearsOfExperience') &&
                           Object.prototype.hasOwnProperty.call(jsonRow, 'availability');

    if (hasValidHeaders) {
      return {
        seniority: String(jsonRow['seniority']),
        yearsOfExperience: jsonRow['yearsOfExperience'] as string | number,
        availability: jsonRow['availability'] as string | boolean
      };
    }

    return this.extractDataWithoutHeaders(rawRow);
  }

  private extractDataWithoutHeaders(rawRow: unknown[]): ProcessedRowData {
    const columnValidation = this.validationService.validateColumnCount(rawRow.length);
    if (!columnValidation.isValid) {
      throw new Error(columnValidation.errors[0]);
    }

    return {
      seniority: String(rawRow[0]),
      yearsOfExperience: rawRow[1] as string | number,
      availability: rawRow[2] as string | boolean
    };
  }

  private validateAndConvertData(data: ProcessedRowData): FileData {
    const normalizedData = this.validationService.normalizeRowData(data);
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

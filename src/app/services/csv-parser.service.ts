import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileData } from '../models/candidate.model';
import {
  FILE_ERROR_KEYS,
  IFileParser,
  ProcessedRowData,
  SUPPORTED_FILE_TYPES
} from '../models/file-parser.model';
import { FileValidationService } from './file-validation.service';

/**
 * Parser específico para archivos CSV
 */
@Injectable({
  providedIn: 'root'
})
export class CsvFileParser implements IFileParser {
  readonly supportedTypes = SUPPORTED_FILE_TYPES.CSV;

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
          const result = this.processCsvFile(e.target?.result as string);
          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error(new Error(`${FILE_ERROR_KEYS.READ_ERROR}: ${error}`));
        }
      };

      reader.onerror = () => {
        observer.error(new Error(FILE_ERROR_KEYS.READ_ERROR));
      };

      reader.readAsText(file);
    });
  }

  private processCsvFile(csvContent: string): FileData {
    const lines = this.parseCSVLines(csvContent);

    // Validar número de filas
    const rowValidation = this.validationService.validateRowCount(lines.length);
    if (!rowValidation.isValid) {
      throw new Error(rowValidation.errors[0]);
    }

    let processedData: ProcessedRowData;

    if (lines.length === 2) {
      // Posible header + data
      processedData = this.extractDataWithPossibleHeaders(lines[0], lines[1]);
    } else {
      // Solo una línea de datos
      processedData = this.extractDataWithoutHeaders(lines[0]);
    }

    return this.validateAndConvertData(processedData);
  }

  private parseCSVLines(csvContent: string): string[][] {
    return csvContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => this.parseCSVLine(line));
  }

  private parseCSVLine(line: string): string[] {
    // Parser simple para CSV - maneja comillas básicas
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result.map(value => value.replace(/^"|"$/g, '')); // Remover comillas
  }

  private extractDataWithPossibleHeaders(firstLine: string[], secondLine: string[]): ProcessedRowData {
    // Verificar si la primera línea son headers válidos
    const headerValidation = this.validationService.validateHeaders(firstLine);

    if (headerValidation.isValid) {
      // Crear objeto con headers
      const dataObject: any = {};
      firstLine.forEach((header, index) => {
        const normalizedHeader = header.trim().toLowerCase();
        if (['seniority', 'yearsofexperience', 'availability'].includes(normalizedHeader)) {
          let key = normalizedHeader;
          if (normalizedHeader === 'yearsofexperience') {
            key = 'yearsOfExperience';
          }
          dataObject[key] = secondLine[index];
        }
      });

      return {
        seniority: dataObject.seniority,
        yearsOfExperience: dataObject.yearsOfExperience,
        availability: dataObject.availability
      };
    }

    // Si no son headers válidos, tratar primera línea como datos
    return this.extractDataWithoutHeaders(firstLine);
  }

  private extractDataWithoutHeaders(dataLine: string[]): ProcessedRowData {
    const columnValidation = this.validationService.validateColumnCount(dataLine.length);
    if (!columnValidation.isValid) {
      throw new Error(columnValidation.errors[0]);
    }

    return {
      seniority: dataLine[0],
      yearsOfExperience: dataLine[1],
      availability: dataLine[2]
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

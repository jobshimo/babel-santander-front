import { Injectable } from '@angular/core';
import {
  DEFAULT_FILE_VALIDATION_CONFIG,
  FILE_ERROR_KEYS,
  FileValidationConfig,
  ProcessedRowData,
  ValidationResult
} from '../models/file-parser.model';

/**
 * Servicio para validar datos de archivos de candidatos
 */
@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  private readonly config: FileValidationConfig = DEFAULT_FILE_VALIDATION_CONFIG;

  constructor() {}

  /**
   * Valida que el archivo tenga el número correcto de filas
   */
  validateRowCount(rowCount: number): ValidationResult {
    if (rowCount === 0) {
      return {
        isValid: false,
        errors: [FILE_ERROR_KEYS.EMPTY]
      };
    }

    if (rowCount > this.config.maxRows) {
      return {
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_ROWS]
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida que los datos de la fila tengan el formato correcto
   */
  validateRowData(data: ProcessedRowData): ValidationResult {
    const errors: string[] = [];

    if (!this.isValidSeniority(data.seniority))
      errors.push(FILE_ERROR_KEYS.INVALID_SENIORITY);


    if (!this.isValidYearsOfExperience(data.yearsOfExperience))
      errors.push(FILE_ERROR_KEYS.INVALID_EXPERIENCE);


    if (!this.isValidAvailability(data.availability))
      errors.push(FILE_ERROR_KEYS.INVALID_AVAILABILITY);


    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida que el número de columnas sea el esperado
   */
  validateColumnCount(columnCount: number): ValidationResult {
    if (columnCount !== this.config.requiredColumns.length) {
      return {
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_COLUMNS]
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Valida si los headers coinciden con los esperados
   */
  validateHeaders(headers: string[]): ValidationResult {
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const expectedHeaders = this.config.requiredColumns.map(h => h.toLowerCase());

    const hasAllHeaders = expectedHeaders.every(header =>
      normalizedHeaders.includes(header)
    );

    if (!hasAllHeaders)
      return {
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_COLUMNS]
      };


    return { isValid: true, errors: [] };
  }

  /**
   * Normaliza y convierte los datos de la fila al formato esperado
   */
  normalizeRowData(data: ProcessedRowData): ProcessedRowData {
    return {
      seniority: this.normalizeSeniority(data.seniority),
      yearsOfExperience: this.normalizeYearsOfExperience(data.yearsOfExperience),
      availability: this.normalizeAvailability(data.availability)
    };
  }

  private isValidSeniority(seniority: string): boolean {
    const normalized = this.normalizeSeniority(seniority);
    return this.config.supportedSeniorityValues.includes(normalized);
  }

  private isValidYearsOfExperience(years: string | number): boolean {
    const normalized = this.normalizeYearsOfExperience(years);
    return typeof normalized === 'number' &&
           !isNaN(normalized) &&
           normalized >= 0;
  }

  private isValidAvailability(availability: string | boolean): boolean {
    if (typeof availability === 'boolean') {
      return true;
    }

    if (typeof availability === 'string') {
      const lower = availability.toLowerCase().trim();
      return lower === 'true' || lower === 'false';
    }

    return false;
  }

  private normalizeSeniority(seniority: string): string {
    return String(seniority).trim().toLowerCase();
  }

  private normalizeYearsOfExperience(years: string | number): number {
    if (typeof years === 'number') {
      return years;
    }

    const parsed = parseInt(String(years).trim(), 10);
    return isNaN(parsed) ? -1 : parsed;
  }

  private normalizeAvailability(availability: string | boolean): boolean {
    if (typeof availability === 'boolean') {
      return availability;
    }

    return String(availability).toLowerCase().trim() === 'true';
  }
}

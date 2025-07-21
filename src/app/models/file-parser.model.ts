import { Observable } from 'rxjs';
import { FileData } from './candidate.model';

/**
 * Interfaz base para todos los parsers de archivos
 */
export interface IFileParser {
  /**
   * Determina si este parser puede manejar el archivo dado
   */
  canParse(file: File): boolean;

  /**
   * Parsea el archivo y retorna los datos extraídos
   */
  parse(file: File): Observable<FileData>;

  /**
   * Tipos de archivo soportados por este parser
   */
  readonly supportedTypes: readonly string[];
}

/**
 * Configuración para la validación de archivos
 */
export interface FileValidationConfig {
  readonly requiredColumns: readonly string[];
  readonly maxRows: number;
  readonly minRows: number;
  readonly supportedSeniorityValues: readonly string[];
}

/**
 * Resultado de la validación de un archivo
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Datos de fila procesados antes de la validación final
 */
export interface ProcessedRowData {
  readonly seniority: string;
  readonly yearsOfExperience: string | number;
  readonly availability: string | boolean;
}

/**
 * Configuración por defecto para la validación de archivos
 */
export const DEFAULT_FILE_VALIDATION_CONFIG: FileValidationConfig = {
  requiredColumns: ['seniority', 'yearsOfExperience', 'availability'],
  maxRows: 2,
  minRows: 1,
  supportedSeniorityValues: ['junior', 'senior']
} as const;

/**
 * Tipos de archivo soportados por la aplicación
 */
export const SUPPORTED_FILE_TYPES = {
  EXCEL: ['.xlsx', '.xls'],
  CSV: ['.csv']
} as const;

/**
 * Claves de traducción para errores de archivo
 */
export const FILE_ERROR_KEYS = {
  EMPTY: 'candidateForm.errors.fileEmpty',
  INVALID_COLUMNS: 'candidateForm.errors.fileInvalidColumns',
  INVALID_SENIORITY: 'candidateForm.errors.fileInvalidSeniority',
  INVALID_EXPERIENCE: 'candidateForm.errors.fileInvalidExperience',
  INVALID_AVAILABILITY: 'candidateForm.errors.fileInvalidAvailability',
  READ_ERROR: 'candidateForm.errors.fileReadError',
  INVALID_ROWS: 'candidateForm.errors.fileInvalidRows',
  COLUMN_MISMATCH: 'candidateForm.errors.fileColumnMismatch'
} as const;

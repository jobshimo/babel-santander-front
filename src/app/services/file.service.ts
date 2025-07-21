import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FileData } from '../models/candidate.model';
import { FILE_ERROR_KEYS } from '../models/file-parser.model';
import { FileParserFactory } from './file-parser.factory';

/**
 * Servicio principal para el manejo de archivos de candidatos
 * Responsabilidades:
 * - Coordinar el parseo de diferentes tipos de archivo
 * - Manejar errores de manera consistente
 * - Proporcionar una API simple para los componentes
 */
@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private readonly parserFactory: FileParserFactory) {}

  /**
   * Parsea un archivo de cualquier tipo soportado
   * @param file - Archivo a parsear
   * @returns Observable con los datos extraídos del archivo
   */
  parseFile(file: File): Observable<FileData> {
    if (!file) {
      return throwError(() => new Error('candidateForm.errors.fileRequired'));
    }

    const parser = this.parserFactory.getParser(file);
    if (!parser) {
      return throwError(() => new Error('candidateForm.errors.fileInvalidFormat'));
    }

    return parser.parse(file).pipe(
      map(data => this.postProcessFileData(data)),
      catchError(error => this.handleParsingError(error))
    );
  }

  /**
   * Verifica si un archivo es soportado por el servicio
   * @param file - Archivo a verificar
   * @returns true si el archivo es soportado
   */
  isFileSupported(file: File): boolean {
    return this.parserFactory.isSupported(file);
  }

  /**
   * Obtiene la lista de extensiones de archivo soportadas
   * @returns Array de extensiones soportadas
   */
  getSupportedFileTypes(): readonly string[] {
    return this.parserFactory.getSupportedTypes();
  }

  /**
   * Post-procesa los datos extraídos del archivo
   * Aquí se pueden agregar transformaciones adicionales si es necesario
   */
  private postProcessFileData(data: FileData): FileData {

    return {
      ...data,
      seniority: data.seniority,
      yearsOfExperience: Number(data.yearsOfExperience),
      availability: Boolean(data.availability)
    };
  }

  /**
   * Maneja errores de parseo de manera consistente
   */
  private handleParsingError(error: any): Observable<never> {
    if (typeof error.message === 'string' && error.message.startsWith('candidateForm.errors.')) {
      return throwError(() => error);
    }

    const errorMessage = error.message || error;
    if (errorMessage.includes(FILE_ERROR_KEYS.EMPTY)) {
      return throwError(() => new Error(FILE_ERROR_KEYS.EMPTY));
    }
    if (errorMessage.includes(FILE_ERROR_KEYS.INVALID_ROWS)) {
      return throwError(() => new Error(FILE_ERROR_KEYS.INVALID_ROWS));
    }
    if (errorMessage.includes(FILE_ERROR_KEYS.INVALID_COLUMNS)) {
      return throwError(() => new Error(FILE_ERROR_KEYS.INVALID_COLUMNS));
    }

    return throwError(() => new Error(FILE_ERROR_KEYS.READ_ERROR));
  }
}

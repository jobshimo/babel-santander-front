import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FileData } from '../models/candidate.model';
import { ErrorTranslationService } from './error-translation.service';
import { FileService } from './file.service';

/**
 * Servicio de alto nivel para el procesamiento de archivos con UI feedback
 * Responsabilidades:
 * - Coordinar el parseo de archivos usando FileService
 * - Manejar la lógica de UI (snackbars, traducciones)
 * - Proporcionar feedback visual al usuario
 */
@Injectable({
  providedIn: 'root'
})
export class FileParsingService {

  constructor(
    private readonly fileService: FileService,
    private readonly errorTranslationService: ErrorTranslationService,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar
  ) { }

  /**
   * Parsea un archivo y muestra feedback visual al usuario
   * @param file - Archivo a parsear
   * @returns Observable con los datos del archivo
   */
  parseFile(file: File): Observable<FileData> {
    // Verificar si el archivo es soportado
    if (!this.fileService.isFileSupported(file)) {
      const errorKey = 'candidateForm.errors.fileInvalidFormat';
      const errorMessage = this.translocoService.translate(errorKey);
      this.showError(errorMessage);
      return throwError(() => new Error(errorKey));
    }

    return this.fileService.parseFile(file).pipe(
      tap(() => {
        this.showSuccess(this.translocoService.translate('candidateForm.fileProcessedCorrectly'));
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene la lista de tipos de archivo soportados para mostrar al usuario
   * @returns Array de extensiones soportadas
   */
  getSupportedFileTypes(): readonly string[] {
    return this.fileService.getSupportedFileTypes();
  }

  /**
   * Verifica si un archivo es soportado
   * @param file - Archivo a verificar
   * @returns true si el archivo es soportado
   */
  isFileSupported(file: File): boolean {
    return this.fileService.isFileSupported(file);
  }

  /**
   * Maneja errores de parseo y muestra feedback visual
   */
  private handleError(error: any): Observable<never> {
    const translatedErrorKey = this.errorTranslationService.getTranslatedError(error.message);
    const errorMessage = this.translocoService.translate(translatedErrorKey);
    this.showError(errorMessage);
    return throwError(() => new Error(translatedErrorKey));
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

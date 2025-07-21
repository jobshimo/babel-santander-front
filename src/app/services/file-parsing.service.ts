import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FileData } from '../models/candidate.model';
import { ErrorTranslationService } from './error-translation.service';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class FileParsingService {

  constructor(
    private fileService: FileService,
    private errorTranslationService: ErrorTranslationService,
    private translocoService: TranslocoService,
    private snackBar: MatSnackBar
  ) { }

  parseFile(file: File): Observable<FileData> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let parseObservable: Observable<FileData>;

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseObservable = this.fileService.parseExcelFile(file);
    } else if (fileExtension === 'csv') {
      parseObservable = this.fileService.parseCSVFile(file);
    } else {
      const errorKey = 'candidateForm.errors.fileInvalidFormat';
      this.showError(this.translocoService.translate(errorKey));
      return throwError(() => new Error(this.translocoService.translate(errorKey)));
    }

    return parseObservable.pipe(
      tap(() => {
        this.showSuccess(this.translocoService.translate('success.candidateRegistered'));
      }),
      catchError(error => {
        const translatedErrorKey = this.errorTranslationService.getTranslatedError(error.message);
        this.showError(this.translocoService.translate(translatedErrorKey));
        return throwError(() => new Error(this.translocoService.translate(translatedErrorKey)));
      })
    );
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

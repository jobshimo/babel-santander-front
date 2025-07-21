import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorTranslationService {
  private errorMapping: Record<string, string> = {
    'vacío': 'candidateForm.errors.fileEmpty',
    'columnas': 'candidateForm.errors.fileInvalidColumns',
    'seniority': 'candidateForm.errors.fileInvalidSeniority',
    'yearsOfExperience': 'candidateForm.errors.fileInvalidExperience',
    'availability': 'candidateForm.errors.fileInvalidAvailability',
    'leer': 'candidateForm.errors.fileReadError',
    'fila': 'candidateForm.errors.fileInvalidRows',
    'coincide': 'candidateForm.errors.fileColumnMismatch'
  };

  private defaultErrorKey = 'candidateForm.errors.fileReadError';

  getTranslatedError(errorMessage: string): string {
    const errorKey = Object.keys(this.errorMapping).find(key => errorMessage.includes(key));
    return errorKey ? this.errorMapping[errorKey] : this.defaultErrorKey;
  }
}

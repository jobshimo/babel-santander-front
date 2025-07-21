import { TestBed } from '@angular/core/testing';
import { ErrorTranslationService } from './error-translation.service';

describe('ErrorTranslationService', () => {
  let service: ErrorTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should translate "vacío" error message', () => {
    const errorMessage = 'El fichero está vacío';
    const expectedKey = 'candidateForm.errors.fileEmpty';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "columnas" error message', () => {
    const errorMessage = 'Las columnas no son válidas';
    const expectedKey = 'candidateForm.errors.fileInvalidColumns';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "seniority" error message', () => {
    const errorMessage = 'Error en seniority';
    const expectedKey = 'candidateForm.errors.fileInvalidSeniority';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "yearsOfExperience" error message', () => {
    const errorMessage = 'Error en yearsOfExperience';
    const expectedKey = 'candidateForm.errors.fileInvalidExperience';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "availability" error message', () => {
    const errorMessage = 'Error en availability';
    const expectedKey = 'candidateForm.errors.fileInvalidAvailability';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "leer" error message', () => {
    const errorMessage = 'No se pudo leer el fichero';
    const expectedKey = 'candidateForm.errors.fileReadError';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "fila" error message', () => {
    const errorMessage = 'Error en una fila';
    const expectedKey = 'candidateForm.errors.fileInvalidRows';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should translate "coincide" error message', () => {
    const errorMessage = 'La cabecera no coincide';
    const expectedKey = 'candidateForm.errors.fileColumnMismatch';
    expect(service.getTranslatedError(errorMessage)).toEqual(expectedKey);
  });

  it('should return default error key for unknown error message', () => {
    const errorMessage = 'Error desconocido';
    const defaultKey = 'candidateForm.errors.fileReadError';
    expect(service.getTranslatedError(errorMessage)).toEqual(defaultKey);
  });

  it('should return default error key for empty error message', () => {
    const errorMessage = '';
    const defaultKey = 'candidateForm.errors.fileReadError';
    expect(service.getTranslatedError(errorMessage)).toEqual(defaultKey);
  });
});

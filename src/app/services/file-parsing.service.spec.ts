import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { FileData } from '../models/candidate.model';
import { ErrorTranslationService } from './error-translation.service';
import { FileParsingService } from './file-parsing.service';
import { FileService } from './file.service';

describe('FileParsingService', () => {
  let service: FileParsingService;
  let mockFileService: any;
  let mockErrorTranslationService: any;
  let mockTranslocoService: any;
  let mockSnackBar: any;

  const mockFileData: FileData = {
    seniority: 'junior',
    yearsOfExperience: 3,
    availability: true
  };

  const createMockFile = (name: string, type: string): File => {
    return new File(['test content'], name, { type });
  };

  beforeEach(() => {
    mockFileService = {
      parseFile: jest.fn(),
      isFileSupported: jest.fn(),
      getSupportedFileTypes: jest.fn()
    };

    mockErrorTranslationService = {
      getTranslatedError: jest.fn()
    };

    mockTranslocoService = {
      translate: jest.fn()
    };

    mockSnackBar = {
      open: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        FileParsingService,
        { provide: FileService, useValue: mockFileService },
        { provide: ErrorTranslationService, useValue: mockErrorTranslationService },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });

    service = TestBed.inject(FileParsingService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseFile', () => {
    it('should successfully parse file and show success message', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const successMessage = 'File processed successfully';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(of(mockFileData));
      mockTranslocoService.translate.mockReturnValue(successMessage);

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result).toEqual(mockFileData);
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).toHaveBeenCalledWith(mockFile);
          expect(mockTranslocoService.translate).toHaveBeenCalledWith('candidateForm.fileProcessedCorrectly');
          expect(mockSnackBar.open).toHaveBeenCalledWith(successMessage, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          done();
        }
      });
    });

    it('should throw error and show error message when file is not supported', (done) => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      const errorKey = 'candidateForm.errors.fileInvalidFormat';
      const errorMessage = 'Invalid file format';

      mockFileService.isFileSupported.mockReturnValue(false);
      mockTranslocoService.translate.mockReturnValue(errorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(errorKey);
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).not.toHaveBeenCalled();
          expect(mockTranslocoService.translate).toHaveBeenCalledWith(errorKey);
          expect(mockSnackBar.open).toHaveBeenCalledWith(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });

    it('should handle parsing error and show translated error message', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileEmpty');
      const translatedErrorKey = 'candidateForm.errors.fileEmpty';
      const translatedErrorMessage = 'File is empty';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(translatedErrorKey);
      mockTranslocoService.translate.mockReturnValue(translatedErrorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(translatedErrorKey);
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).toHaveBeenCalledWith(mockFile);
          expect(mockErrorTranslationService.getTranslatedError).toHaveBeenCalledWith('candidateForm.errors.fileEmpty');
          expect(mockTranslocoService.translate).toHaveBeenCalledWith(translatedErrorKey);
          expect(mockSnackBar.open).toHaveBeenCalledWith(translatedErrorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });

    it('should handle parsing error without success message when parsing fails', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileInvalidColumns');
      const translatedErrorKey = 'candidateForm.errors.fileInvalidColumns';
      const translatedErrorMessage = 'Invalid columns';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(translatedErrorKey);
      mockTranslocoService.translate.mockReturnValue(translatedErrorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(translatedErrorKey);
          expect(mockSnackBar.open).toHaveBeenCalledTimes(1); // Solo el error, no success
          expect(mockSnackBar.open).toHaveBeenCalledWith(translatedErrorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });
  });

  describe('getSupportedFileTypes', () => {
    it('should return supported file types from FileService', () => {
      const supportedTypes = ['.csv', '.xlsx', '.xls'];
      mockFileService.getSupportedFileTypes.mockReturnValue(supportedTypes);

      const result = service.getSupportedFileTypes();

      expect(result).toEqual(supportedTypes);
      expect(mockFileService.getSupportedFileTypes).toHaveBeenCalled();
    });

    it('should return readonly array', () => {
      const supportedTypes = ['.csv', '.xlsx'];
      mockFileService.getSupportedFileTypes.mockReturnValue(supportedTypes);

      const result = service.getSupportedFileTypes();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(supportedTypes);
    });
  });

  describe('isFileSupported', () => {
    it('should return true when file is supported', () => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      mockFileService.isFileSupported.mockReturnValue(true);

      const result = service.isFileSupported(mockFile);

      expect(result).toBe(true);
      expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
    });

    it('should return false when file is not supported', () => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      mockFileService.isFileSupported.mockReturnValue(false);

      const result = service.isFileSupported(mockFile);

      expect(result).toBe(false);
      expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('handleError (private method behavior)', () => {
    it('should translate error and show error snackbar', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileReadError');
      const translatedErrorKey = 'candidateForm.errors.fileReadError';
      const translatedErrorMessage = 'Error reading file';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(translatedErrorKey);
      mockTranslocoService.translate.mockReturnValue(translatedErrorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(mockErrorTranslationService.getTranslatedError).toHaveBeenCalledWith('candidateForm.errors.fileReadError');
          expect(mockTranslocoService.translate).toHaveBeenCalledWith(translatedErrorKey);
          expect(mockSnackBar.open).toHaveBeenCalledWith(translatedErrorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });

    it('should handle different error types correctly', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileInvalidSeniority');
      const translatedErrorKey = 'candidateForm.errors.fileInvalidSeniority';
      const translatedErrorMessage = 'Invalid seniority value';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(translatedErrorKey);
      mockTranslocoService.translate.mockReturnValue(translatedErrorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(translatedErrorKey);
          expect(mockErrorTranslationService.getTranslatedError).toHaveBeenCalledWith('candidateForm.errors.fileInvalidSeniority');
          done();
        }
      });
    });
  });

  describe('showSuccess (private method behavior)', () => {
    it('should show success snackbar with correct configuration', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const successMessage = 'File processed correctly';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(of(mockFileData));
      mockTranslocoService.translate.mockReturnValue(successMessage);

      service.parseFile(mockFile).subscribe({
        next: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(successMessage, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          done();
        }
      });
    });
  });

  describe('showError (private method behavior)', () => {
    it('should show error snackbar with correct configuration for unsupported file', (done) => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      const errorMessage = 'File format not supported';

      mockFileService.isFileSupported.mockReturnValue(false);
      mockTranslocoService.translate.mockReturnValue(errorMessage);

      service.parseFile(mockFile).subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });

    it('should show error snackbar with correct configuration for parsing errors', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileEmpty');
      const errorMessage = 'File is empty';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue('candidateForm.errors.fileEmpty');
      mockTranslocoService.translate.mockReturnValue(errorMessage);

      service.parseFile(mockFile).subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          done();
        }
      });
    });
  });

  describe('integration behavior', () => {
    it('should not call FileService.parseFile when file is not supported', (done) => {
      const mockFile = createMockFile('test.pdf', 'application/pdf');

      mockFileService.isFileSupported.mockReturnValue(false);
      mockTranslocoService.translate.mockReturnValue('File not supported');

      service.parseFile(mockFile).subscribe({
        error: () => {
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle null or undefined error messages gracefully', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error(); // Error sin mensaje
      const defaultErrorKey = 'candidateForm.errors.fileReadError';
      const defaultErrorMessage = 'Read error';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(defaultErrorKey);
      mockTranslocoService.translate.mockReturnValue(defaultErrorMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(defaultErrorKey);
          expect(mockErrorTranslationService.getTranslatedError).toHaveBeenCalledWith('');
          done();
        }
      });
    });

    it('should properly chain all services in success flow', (done) => {
      const mockFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const successMessage = 'Excel file processed';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(of(mockFileData));
      mockTranslocoService.translate.mockReturnValue(successMessage);

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          // Verificar que todos los servicios fueron llamados
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).toHaveBeenCalledWith(mockFile);
          expect(mockTranslocoService.translate).toHaveBeenCalledWith('candidateForm.fileProcessedCorrectly');
          expect(mockSnackBar.open).toHaveBeenCalled();
          expect(result).toEqual(mockFileData);
          done();
        }
      });
    });

    it('should properly chain all services in error flow', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const originalError = new Error('candidateForm.errors.fileInvalidAvailability');
      const translatedKey = 'candidateForm.errors.fileInvalidAvailability';
      const translatedMessage = 'Invalid availability';

      mockFileService.isFileSupported.mockReturnValue(true);
      mockFileService.parseFile.mockReturnValue(throwError(() => originalError));
      mockErrorTranslationService.getTranslatedError.mockReturnValue(translatedKey);
      mockTranslocoService.translate.mockReturnValue(translatedMessage);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          // Verificar que todos los servicios fueron llamados
          expect(mockFileService.isFileSupported).toHaveBeenCalledWith(mockFile);
          expect(mockFileService.parseFile).toHaveBeenCalledWith(mockFile);
          expect(mockErrorTranslationService.getTranslatedError).toHaveBeenCalledWith('candidateForm.errors.fileInvalidAvailability');
          expect(mockTranslocoService.translate).toHaveBeenCalledWith(translatedKey);
          expect(mockSnackBar.open).toHaveBeenCalledWith(translatedMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          expect(error.message).toBe(translatedKey);
          done();
        }
      });
    });
  });
});

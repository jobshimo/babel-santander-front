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
  let fileServiceSpy: jest.Mocked<FileService>;
  let errorTranslationServiceSpy: jest.Mocked<ErrorTranslationService>;
  let snackBarSpy: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    const fileServiceSpyObj = {
      parseExcelFile: jest.fn(),
      parseCSVFile: jest.fn()
    };
    const errorTranslationServiceSpyObj = {
      getTranslatedError: jest.fn()
    };
    const snackBarSpyObj = {
      open: jest.fn()
    };
    const translocoServiceSpyObj = {
      translate: jest.fn((key: string) => {
        const translations: { [key: string]: string } = {
          'candidateForm.errors.fileInvalidFormat': 'Invalid file format',
          'candidateForm.errors.fileReadError': 'File read error'
        };
        return translations[key] || key;
      }),
      selectTranslate: jest.fn(() => of('mockTranslation'))
    };

    TestBed.configureTestingModule({
      providers: [
        FileParsingService,
        { provide: FileService, useValue: fileServiceSpyObj },
        { provide: ErrorTranslationService, useValue: errorTranslationServiceSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
        { provide: TranslocoService, useValue: translocoServiceSpyObj } // Mock TranslocoService
      ]
    });

    service = TestBed.inject(FileParsingService);
    fileServiceSpy = TestBed.inject(FileService) as jest.Mocked<FileService>;
    errorTranslationServiceSpy = TestBed.inject(ErrorTranslationService) as jest.Mocked<ErrorTranslationService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  it('should parse Excel files correctly', () => {
    const mockFile = new File([''], 'test.xlsx');
    const mockFileData: FileData = {
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: true
    };
    fileServiceSpy.parseExcelFile.mockReturnValue(of(mockFileData));

    service.parseFile(mockFile).subscribe((result) => {
      expect(result).toEqual(mockFileData);
    });

    expect(fileServiceSpy.parseExcelFile).toHaveBeenCalledWith(mockFile);
  });

  it('should parse CSV files correctly', () => {
    const mockFile = new File([''], 'test.csv');
    const mockFileData: FileData = {
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: true
    };
    fileServiceSpy.parseCSVFile.mockReturnValue(of(mockFileData));

    service.parseFile(mockFile).subscribe((result) => {
      expect(result).toEqual(mockFileData);
    });

    expect(fileServiceSpy.parseCSVFile).toHaveBeenCalledWith(mockFile);
  });

  it('should handle invalid file formats', () => {
    const mockFile = new File([''], 'test.txt');

    service.parseFile(mockFile).subscribe({
      error: (error) => {
        expect(error.message).toBe('Invalid file format');
      }
    });

    expect(snackBarSpy.open).toHaveBeenCalledWith('Invalid file format', 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  });

  it('should handle errors during file parsing', () => {
    const mockFile = new File([''], 'test.csv');
    const mockError = new Error('File read error');
    fileServiceSpy.parseCSVFile.mockReturnValue(throwError(() => mockError));
    errorTranslationServiceSpy.getTranslatedError.mockReturnValue('candidateForm.errors.fileReadError');

    service.parseFile(mockFile).subscribe({
      error: (error) => {
        expect(error.message).toBe('File read error');
      }
    });

    expect(snackBarSpy.open).toHaveBeenCalledWith('File read error', 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  });
});

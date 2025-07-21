import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FileData } from '../models/candidate.model';
import { FILE_ERROR_KEYS, IFileParser } from '../models/file-parser.model';
import { FileParserFactory } from './file-parser.factory';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let mockParserFactory: any;
  let mockParser: jest.Mocked<IFileParser>;

  const mockFileData: FileData = {
    seniority: 'junior',
    yearsOfExperience: 3,
    availability: true
  };

  const createMockFile = (name: string, type: string): File => {
    return new File(['test content'], name, { type });
  };

  beforeEach(() => {
    mockParser = {
      canParse: jest.fn(),
      parse: jest.fn(),
      supportedTypes: ['.csv', '.xlsx']
    };

    mockParserFactory = {
      getParser: jest.fn(),
      isSupported: jest.fn(),
      getSupportedTypes: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        FileService,
        { provide: FileParserFactory, useValue: mockParserFactory }
      ]
    });

    service = TestBed.inject(FileService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseFile', () => {
    it('should throw error when file is null', (done) => {
      service.parseFile(null as any).subscribe({
        error: (error) => {
          expect(error.message).toBe('candidateForm.errors.fileRequired');
          done();
        }
      });
    });

    it('should throw error when file is undefined', (done) => {
      service.parseFile(undefined as any).subscribe({
        error: (error) => {
          expect(error.message).toBe('candidateForm.errors.fileRequired');
          done();
        }
      });
    });

    it('should throw error when no parser is found for file type', (done) => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      mockParserFactory.getParser.mockReturnValue(null);

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe('candidateForm.errors.fileInvalidFormat');
          expect(mockParserFactory.getParser).toHaveBeenCalledWith(mockFile);
          done();
        }
      });
    });

    it('should successfully parse file and post-process data', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const rawData = {
        seniority: 'junior' as const,
        yearsOfExperience: '3', // String que debería convertirse a number
        availability: 'true' // String que debería convertirse a boolean
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(of(rawData as any));

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result).toEqual({
            seniority: 'junior',
            yearsOfExperience: 3,
            availability: true
          });
          expect(mockParserFactory.getParser).toHaveBeenCalledWith(mockFile);
          expect(mockParser.parse).toHaveBeenCalledWith(mockFile);
          done();
        }
      });
    });

    it('should handle parsing errors and map to specific error keys', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const errorWithEmptyKey = new Error('File contains ' + FILE_ERROR_KEYS.EMPTY);

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => errorWithEmptyKey));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.EMPTY);
          done();
        }
      });
    });

    it('should handle parsing errors for invalid rows', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const errorWithInvalidRows = new Error('Invalid rows detected');

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => errorWithInvalidRows));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.READ_ERROR);
          done();
        }
      });
    });

    it('should handle parsing errors for invalid columns', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const errorWithInvalidColumns = new Error('Contains ' + FILE_ERROR_KEYS.INVALID_COLUMNS);

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => errorWithInvalidColumns));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.INVALID_COLUMNS);
          done();
        }
      });
    });

    it('should preserve translation keys when error message starts with candidateForm.errors', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const translationError = new Error('candidateForm.errors.customError');

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => translationError));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe('candidateForm.errors.customError');
          done();
        }
      });
    });

    it('should handle errors without message property', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const stringError = 'Simple string error';

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => stringError));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.READ_ERROR);
          done();
        }
      });
    });
  });

  describe('isFileSupported', () => {
    it('should return true when file is supported', () => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      mockParserFactory.isSupported.mockReturnValue(true);

      const result = service.isFileSupported(mockFile);

      expect(result).toBe(true);
      expect(mockParserFactory.isSupported).toHaveBeenCalledWith(mockFile);
    });

    it('should return false when file is not supported', () => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      mockParserFactory.isSupported.mockReturnValue(false);

      const result = service.isFileSupported(mockFile);

      expect(result).toBe(false);
      expect(mockParserFactory.isSupported).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('getSupportedFileTypes', () => {
    it('should return supported file types from factory', () => {
      const supportedTypes = ['.csv', '.xlsx', '.xls'];
      mockParserFactory.getSupportedTypes.mockReturnValue(supportedTypes);

      const result = service.getSupportedFileTypes();

      expect(result).toEqual(supportedTypes);
      expect(mockParserFactory.getSupportedTypes).toHaveBeenCalled();
    });

    it('should return readonly array', () => {
      const supportedTypes = ['.csv', '.xlsx'];
      mockParserFactory.getSupportedTypes.mockReturnValue(supportedTypes);

      const result = service.getSupportedFileTypes();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(supportedTypes);
    });
  });

  describe('postProcessFileData (private method behavior)', () => {
    it('should convert string yearsOfExperience to number', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const rawData = {
        seniority: 'senior' as const,
        yearsOfExperience: '5',
        availability: true
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(of(rawData as any));

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result.yearsOfExperience).toBe(5);
          expect(typeof result.yearsOfExperience).toBe('number');
          done();
        }
      });
    });

    it('should convert string availability to boolean', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const rawData = {
        seniority: 'junior' as const,
        yearsOfExperience: 2,
        availability: 'false' // String 'false' se convierte a boolean true
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(of(rawData as any));

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result.availability).toBe(true); // Boolean('false') = true
          expect(typeof result.availability).toBe('boolean');
          done();
        }
      });
    });

    it('should convert empty string availability to false', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const rawData = {
        seniority: 'junior' as const,
        yearsOfExperience: 2,
        availability: '' // Empty string se convierte a boolean false
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(of(rawData as any));

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result.availability).toBe(false); // Boolean('') = false
          expect(typeof result.availability).toBe('boolean');
          done();
        }
      });
    });

    it('should preserve seniority value as is', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const rawData = {
        seniority: 'senior' as const,
        yearsOfExperience: 7,
        availability: true
      };

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(of(rawData as any));

      service.parseFile(mockFile).subscribe({
        next: (result) => {
          expect(result.seniority).toBe('senior');
          done();
        }
      });
    });
  });

  describe('error handling edge cases', () => {
    it('should handle FILE_ERROR_KEYS.INVALID_ROWS in error message', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const error = new Error('Error with ' + FILE_ERROR_KEYS.INVALID_ROWS + ' detected');

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => error));

      service.parseFile(mockFile).subscribe({
        error: (err) => {
          expect(err.message).toBe(FILE_ERROR_KEYS.INVALID_ROWS);
          done();
        }
      });
    });

    it('should default to READ_ERROR for unknown error types', (done) => {
      const mockFile = createMockFile('test.csv', 'text/csv');
      const unknownError = new Error('Unknown error type');

      mockParserFactory.getParser.mockReturnValue(mockParser);
      mockParser.parse.mockReturnValue(throwError(() => unknownError));

      service.parseFile(mockFile).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.READ_ERROR);
          done();
        }
      });
    });
  });
});

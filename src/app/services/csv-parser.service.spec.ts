import { TestBed } from '@angular/core/testing';
import {
  FILE_ERROR_KEYS,
  SUPPORTED_FILE_TYPES
} from '../models/file-parser.model';
import { CsvFileParser } from './csv-parser.service';
import { FileValidationService } from './file-validation.service';

describe('CsvFileParser', () => {
  let service: CsvFileParser;
  let mockValidationService: any;

  const createMockFile = (name: string, type: string): File => {
    return new File(['mock content'], name, { type });
  };

  const mockFileReader = (content: string | null, shouldError = false) => {
    const originalFileReader = window.FileReader;

    const mockReader = {
      result: content,
      onload: null as any,
      onerror: null as any,
      readAsText: jest.fn().mockImplementation(() => {
        setTimeout(() => {
          if (shouldError && mockReader.onerror) {
            mockReader.onerror();
          } else if (mockReader.onload) {
            mockReader.onload({ target: { result: content } });
          }
        }, 0);
      })
    };

    window.FileReader = jest.fn(() => mockReader) as any;

    return () => {
      window.FileReader = originalFileReader;
    };
  };

  beforeEach(() => {
    mockValidationService = {
      validateRowCount: jest.fn(),
      validateColumnCount: jest.fn(),
      validateHeaders: jest.fn(),
      validateRowData: jest.fn(),
      normalizeRowData: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CsvFileParser,
        { provide: FileValidationService, useValue: mockValidationService }
      ]
    });

    service = TestBed.inject(CsvFileParser);
    jest.clearAllMocks();

    // Setup default successful mocks
    mockValidationService.validateRowCount.mockReturnValue({ isValid: true, errors: [] });
    mockValidationService.validateColumnCount.mockReturnValue({ isValid: true, errors: [] });
    mockValidationService.validateHeaders.mockReturnValue({ isValid: true, errors: [] });
    mockValidationService.validateRowData.mockReturnValue({ isValid: true, errors: [] });
    mockValidationService.normalizeRowData.mockReturnValue({
      seniority: 'junior',
      yearsOfExperience: 3,
      availability: true
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('supportedTypes', () => {
    it('should have correct supported file types', () => {
      expect(service.supportedTypes).toEqual(SUPPORTED_FILE_TYPES.CSV);
      expect(service.supportedTypes).toContain('.csv');
    });
  });

  describe('canParse', () => {
    it('should return true for .csv files', () => {
      const file = createMockFile('test.csv', 'text/csv');
      expect(service.canParse(file)).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      const file = createMockFile('test.CSV', 'text/csv');
      expect(service.canParse(file)).toBe(true);
    });

    it('should return false for unsupported file types', () => {
      const xlsxFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const txtFile = createMockFile('test.txt', 'text/plain');

      expect(service.canParse(xlsxFile)).toBe(false);
      expect(service.canParse(txtFile)).toBe(false);
    });
  });

  describe('parse', () => {
    it('should successfully parse CSV file with headers', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,true';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      service.parse(file).subscribe({
        next: (result) => {
          expect(result.seniority).toBe('junior');
          expect(result.yearsOfExperience).toBe(3);
          expect(result.availability).toBe(true);
          expect(mockValidationService.validateRowCount).toHaveBeenCalledWith(2);
          expect(mockValidationService.validateHeaders).toHaveBeenCalledWith(['seniority', 'yearsOfExperience', 'availability']);
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });

    it('should successfully parse CSV file without headers', (done) => {
      const csvContent = 'senior,5,false';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      mockValidationService.normalizeRowData.mockReturnValue({
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      });

      service.parse(file).subscribe({
        next: (result) => {
          expect(result.seniority).toBe('senior');
          expect(result.yearsOfExperience).toBe(5);
          expect(result.availability).toBe(false);
          expect(mockValidationService.validateRowCount).toHaveBeenCalledWith(1);
          expect(mockValidationService.validateColumnCount).toHaveBeenCalledWith(3);
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle FileReader error', (done) => {
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader('', true); // shouldError = true

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.READ_ERROR);
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle empty CSV file', (done) => {
      const csvContent = '';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      mockValidationService.validateRowCount.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.EMPTY]
      });

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.EMPTY);
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle column count validation error', (done) => {
      const csvContent = 'junior,3'; // Missing availability column
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      mockValidationService.validateColumnCount.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_COLUMNS]
      });

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.INVALID_COLUMNS);
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle row data validation error', (done) => {
      const csvContent = 'invalid,3,true';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      mockValidationService.validateRowData.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_SENIORITY]
      });

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
          restoreFileReader();
          done();
        }
      });
    });
  });

  describe('CSV parsing logic', () => {
    it('should parse CSV with quotes correctly', (done) => {
      const csvContent = '"seniority","yearsOfExperience","availability"\n"junior","2","true"';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      service.parse(file).subscribe({
        next: () => {
          expect(mockValidationService.validateHeaders).toHaveBeenCalledWith([
            'seniority', 'yearsOfExperience', 'availability'
          ]);
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle CSV with spaces correctly', (done) => {
      const csvContent = ' seniority , yearsOfExperience , availability \n junior , 4 , true ';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      service.parse(file).subscribe({
        next: () => {
          expect(mockValidationService.validateHeaders).toHaveBeenCalledWith([
            'seniority', 'yearsOfExperience', 'availability'
          ]);
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });

    it('should handle CSV with commas inside quoted values', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\n"senior, experienced",5,"true"';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      mockValidationService.normalizeRowData.mockReturnValue({
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: true
      });

      service.parse(file).subscribe({
        next: () => {
          expect(mockValidationService.normalizeRowData).toHaveBeenCalledWith({
            seniority: 'senior, experienced',
            yearsOfExperience: '5',
            availability: 'true'
          });
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });

    it('should filter out empty lines', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\n\njunior,1,true\n\n';
      const file = createMockFile('test.csv', 'text/csv');
      const restoreFileReader = mockFileReader(csvContent);

      service.parse(file).subscribe({
        next: () => {
          // Should have 2 lines after filtering empty ones
          expect(mockValidationService.validateRowCount).toHaveBeenCalledWith(2);
          restoreFileReader();
          done();
        },
        error: () => {
          restoreFileReader();
          done();
        }
      });
    });
  });
});

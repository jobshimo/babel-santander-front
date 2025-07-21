import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import * as XLSX from 'xlsx';
import { ExcelFileParser } from './excel-parser.service';
import { FileValidationService } from './file-validation.service';
import { FileData } from '../models/candidate.model';
import { 
  FILE_ERROR_KEYS,
  SUPPORTED_FILE_TYPES,
  ProcessedRowData
} from '../models/file-parser.model';

// Mock XLSX library
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}));

describe('ExcelFileParser', () => {
  let service: ExcelFileParser;
  let mockValidationService: any;
  let mockXLSX: any;

  const createMockFile = (name: string, type: string): File => {
    return new File(['mock content'], name, { type });
  };

  const createMockArrayBuffer = (): ArrayBuffer => {
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    view[0] = 80; // Mock Excel file signature
    return buffer;
  };

  const mockValidFileData: FileData = {
    seniority: 'junior',
    yearsOfExperience: 3,
    availability: true
  };

  const mockProcessedRowData: ProcessedRowData = {
    seniority: 'junior',
    yearsOfExperience: '3',
    availability: 'true'
  };

  beforeEach(() => {
    mockValidationService = {
      validateRowCount: jest.fn(),
      validateColumnCount: jest.fn(),
      validateRowData: jest.fn(),
      normalizeRowData: jest.fn()
    };

    mockXLSX = XLSX as jest.Mocked<typeof XLSX>;

    TestBed.configureTestingModule({
      providers: [
        ExcelFileParser,
        { provide: FileValidationService, useValue: mockValidationService }
      ]
    });

    service = TestBed.inject(ExcelFileParser);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('supportedTypes', () => {
    it('should have correct supported file types', () => {
      expect(service.supportedTypes).toEqual(SUPPORTED_FILE_TYPES.EXCEL);
      expect(service.supportedTypes).toContain('.xlsx');
      expect(service.supportedTypes).toContain('.xls');
    });

    it('should be readonly', () => {
      expect(Array.isArray(service.supportedTypes)).toBe(true);
      expect(service.supportedTypes).toEqual(['.xlsx', '.xls']);
    });
  });

  describe('canParse', () => {
    it('should return true for .xlsx files', () => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(service.canParse(file)).toBe(true);
    });

    it('should return true for .xls files', () => {
      const file = createMockFile('test.xls', 'application/vnd.ms-excel');
      expect(service.canParse(file)).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      const file = createMockFile('test.XLSX', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(service.canParse(file)).toBe(true);
    });

    it('should return false for unsupported file types', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      const txtFile = createMockFile('test.txt', 'text/plain');
      const pdfFile = createMockFile('test.pdf', 'application/pdf');

      expect(service.canParse(csvFile)).toBe(false);
      expect(service.canParse(txtFile)).toBe(false);
      expect(service.canParse(pdfFile)).toBe(false);
    });

    it('should handle files with no extension', () => {
      const file = createMockFile('test', 'application/octet-stream');
      expect(service.canParse(file)).toBe(false);
    });
  });

  describe('parse', () => {
    beforeEach(() => {
      // Setup default mocks for successful parsing
      mockValidationService.validateRowCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.validateColumnCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.normalizeRowData.mockReturnValue({
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: true
      });
      mockValidationService.validateRowData.mockReturnValue({ isValid: true, errors: [] });
    });

    it('should successfully parse Excel file with headers', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      // Mock XLSX library responses
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          'Sheet1': {} // Mock worksheet
        }
      };

      const mockRawData = [
        ['seniority', 'yearsOfExperience', 'availability'],
        ['junior', 3, true]
      ];

      const mockJsonData = [
        {
          seniority: 'junior',
          yearsOfExperience: 3,
          availability: true
        }
      ];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData) // First call with header: 1
        .mockReturnValueOnce(mockJsonData); // Second call without header: 1

      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        next: (result) => {
          expect(result).toEqual({
            seniority: 'junior',
            yearsOfExperience: 3,
            availability: true
          });
          expect(mockXLSX.read).toHaveBeenCalled();
          expect(mockValidationService.validateRowCount).toHaveBeenCalledWith(2);
          expect(mockValidationService.normalizeRowData).toHaveBeenCalled();
          expect(mockValidationService.validateRowData).toHaveBeenCalled();
          done();
        },
        error: done
      });

      // Simulate successful file read
      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should successfully parse Excel file without headers', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          'Sheet1': {}
        }
      };

      const mockRawData = [
        ['junior', 3, true] // No headers
      ];

      const mockJsonData: any[] = []; // Empty when no headers

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        next: (result) => {
          expect(result).toEqual({
            seniority: 'junior',
            yearsOfExperience: 3,
            availability: true
          });
          expect(mockValidationService.validateColumnCount).toHaveBeenCalledWith(3);
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle FileReader error', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        error: (error) => {
          expect(error.message).toBe(FILE_ERROR_KEYS.READ_ERROR);
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onerror();
      }, 0);
    });

    it('should handle row count validation error', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      mockValidationService.validateRowCount.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.EMPTY]
      });

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json.mockReturnValueOnce([]);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.EMPTY);
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle column count validation error for data without headers', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      mockValidationService.validateColumnCount.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_COLUMNS]
      });

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockRawData = [['junior', 3]]; // Missing availability column
      const mockJsonData: any[] = [];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.INVALID_COLUMNS);
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle row data validation error', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      mockValidationService.validateRowData.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.INVALID_SENIORITY]
      });

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockRawData = [['invalid', 3, true]];
      const mockJsonData: any[] = [];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle XLSX parsing errors', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      mockXLSX.read.mockImplementation(() => {
        throw new Error('Corrupted file');
      });

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const parseObservable = service.parse(file);

      parseObservable.subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain('Corrupted file');
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });
  });

  describe('processExcelFile (private method behavior)', () => {
    beforeEach(() => {
      mockValidationService.validateRowCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.validateColumnCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.normalizeRowData.mockReturnValue({
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      });
      mockValidationService.validateRowData.mockReturnValue({ isValid: true, errors: [] });
    });

    it('should process file with valid headers correctly', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockRawData = [
        ['seniority', 'yearsOfExperience', 'availability'],
        ['senior', 5, false]
      ];

      const mockJsonData = [
        {
          seniority: 'senior',
          yearsOfExperience: 5,
          availability: false
        }
      ];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        next: (result) => {
          expect(mockValidationService.normalizeRowData).toHaveBeenCalledWith({
            seniority: 'senior',
            yearsOfExperience: 5,
            availability: false
          });
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should fallback to no-header processing when headers are invalid', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockRawData = [
        ['col1', 'col2', 'col3'], // Invalid headers
        ['junior', 2, true]
      ];

      const mockJsonData = [
        {
          col1: 'junior',
          col2: 2,
          col3: true
        }
      ];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        next: (result) => {
          // Should use raw data fallback since headers are not valid
          expect(mockValidationService.validateColumnCount).toHaveBeenCalledWith(3);
          expect(mockValidationService.normalizeRowData).toHaveBeenCalledWith({
            seniority: 'col1',
            yearsOfExperience: 'col2',
            availability: 'col3'
          });
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle multiple sheets by using first sheet', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1', 'Sheet2', 'Sheet3'],
        Sheets: { 
          'Sheet1': {},
          'Sheet2': {},
          'Sheet3': {}
        }
      };

      const mockRawData = [['junior', 1, true]];
      const mockJsonData: any[] = [];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json.mockReturnValue([]).mockReturnValue([]);

      // Mock the specific calls
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        next: (result) => {
          // Verify it used the first sheet
          expect(mockXLSX.utils.sheet_to_json).toHaveBeenCalledWith(
            mockWorkbook.Sheets['Sheet1'], 
            { header: 1 }
          );
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });
  });

  describe('data extraction methods (private methods behavior)', () => {
    beforeEach(() => {
      mockValidationService.validateRowCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.validateColumnCount.mockReturnValue({ isValid: true, errors: [] });
      mockValidationService.normalizeRowData.mockReturnValue({
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: true
      });
      mockValidationService.validateRowData.mockReturnValue({ isValid: true, errors: [] });
    });

    it('should extract data with valid headers', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockJsonData = [
        {
          seniority: 'junior',
          yearsOfExperience: 3,
          availability: true
        }
      ];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce([['junior', 3, true]])
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        next: (result) => {
          expect(mockValidationService.normalizeRowData).toHaveBeenCalledWith({
            seniority: 'junior',
            yearsOfExperience: 3,
            availability: true
          });
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should extract data without headers using column position', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: { 'Sheet1': {} }
      };

      const mockRawData = [['senior', 7, false]];
      const mockJsonData: any[] = [];

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json
        .mockReturnValueOnce(mockRawData)
        .mockReturnValueOnce(mockJsonData);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        next: (result) => {
          expect(mockValidationService.validateColumnCount).toHaveBeenCalledWith(3);
          expect(mockValidationService.normalizeRowData).toHaveBeenCalledWith({
            seniority: 'senior',
            yearsOfExperience: 7,
            availability: false
          });
          done();
        },
        error: done
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });
  });

  describe('integration and edge cases', () => {
    it('should handle empty workbook', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockValidationService.validateRowCount.mockReturnValue({
        isValid: false,
        errors: [FILE_ERROR_KEYS.EMPTY]
      });

      const mockWorkbook = {
        SheetNames: [],
        Sheets: {}
      };

      mockXLSX.read.mockReturnValue(mockWorkbook);
      mockXLSX.utils.sheet_to_json.mockReturnValue([]);

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });

    it('should handle invalid ArrayBuffer', (done) => {
      const file = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      mockXLSX.read.mockImplementation(() => {
        throw new Error('Invalid buffer');
      });

      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsArrayBuffer: jest.fn()
      };

      jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      service.parse(file).subscribe({
        error: (error) => {
          expect(error.message).toContain(FILE_ERROR_KEYS.READ_ERROR);
          expect(error.message).toContain('Invalid buffer');
          done();
        }
      });

      setTimeout(() => {
        mockFileReader.onload({ target: { result: createMockArrayBuffer() } });
      }, 0);
    });
  });
});

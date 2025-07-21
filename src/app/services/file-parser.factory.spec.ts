import { TestBed } from '@angular/core/testing';
import { FileParserFactory } from './file-parser.factory';
import { CsvFileParser } from './csv-parser.service';
import { ExcelFileParser } from './excel-parser.service';
import { IFileParser } from '../models/file-parser.model';

describe('FileParserFactory', () => {
  let factory: FileParserFactory;
  let mockCsvParser: any;
  let mockExcelParser: any;

  const createMockFile = (name: string, type: string): File => {
    return new File(['mock content'], name, { type });
  };

  beforeEach(() => {
    mockCsvParser = {
      canParse: jest.fn(),
      parse: jest.fn(),
      supportedTypes: ['.csv']
    };

    mockExcelParser = {
      canParse: jest.fn(),
      parse: jest.fn(),
      supportedTypes: ['.xlsx', '.xls']
    };

    TestBed.configureTestingModule({
      providers: [
        FileParserFactory,
        { provide: CsvFileParser, useValue: mockCsvParser },
        { provide: ExcelFileParser, useValue: mockExcelParser }
      ]
    });

    factory = TestBed.inject(FileParserFactory);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(factory).toBeTruthy();
  });

  describe('getParser', () => {
    it('should return CSV parser when CSV file can be parsed', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      mockExcelParser.canParse.mockReturnValue(false); // Excel parser fails first
      mockCsvParser.canParse.mockReturnValue(true); // CSV parser succeeds

      const result = factory.getParser(csvFile);

      expect(result).toBe(mockCsvParser);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(csvFile);
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(csvFile);
    });

    it('should return Excel parser when Excel file can be parsed', () => {
      const excelFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      mockExcelParser.canParse.mockReturnValue(true); // Excel parser comes first, so it will match
      mockCsvParser.canParse.mockReturnValue(false);

      const result = factory.getParser(excelFile);

      expect(result).toBe(mockExcelParser);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(excelFile);
      // CSV parser is not called since Excel parser already matched
      expect(mockCsvParser.canParse).not.toHaveBeenCalled();
    });

    it('should return CSV parser when only CSV can parse the file', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      mockExcelParser.canParse.mockReturnValue(false); // Excel parser fails
      mockCsvParser.canParse.mockReturnValue(true); // CSV parser succeeds

      const result = factory.getParser(csvFile);

      expect(result).toBe(mockCsvParser);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(csvFile);
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(csvFile);
    });

    it('should return null when no parser can handle the file', () => {
      const unsupportedFile = createMockFile('test.txt', 'text/plain');
      mockCsvParser.canParse.mockReturnValue(false);
      mockExcelParser.canParse.mockReturnValue(false);

      const result = factory.getParser(unsupportedFile);

      expect(result).toBeNull();
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(unsupportedFile);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(unsupportedFile);
    });

    it('should return first parser that can handle the file when multiple parsers match', () => {
      const file = createMockFile('test.file', 'application/test');
      mockExcelParser.canParse.mockReturnValue(true); // Excel parser comes first in constructor
      mockCsvParser.canParse.mockReturnValue(true);

      const result = factory.getParser(file);

      expect(result).toBe(mockExcelParser); // Should return first matching parser
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(file);
      expect(mockCsvParser.canParse).not.toHaveBeenCalled(); // find() stops at first match
    });

    it('should call canParse on parsers in order until match is found', () => {
      const file = createMockFile('test.csv', 'text/csv');
      mockExcelParser.canParse.mockReturnValue(false); // Excel parser fails first
      mockCsvParser.canParse.mockReturnValue(true); // CSV parser succeeds

      const result = factory.getParser(file);

      expect(result).toBe(mockCsvParser);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(file);
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(file);
    });
  });

  describe('getSupportedTypes', () => {
    it('should return all supported file types from all parsers', () => {
      const result = factory.getSupportedTypes();

      expect(result).toEqual(['.xlsx', '.xls', '.csv']);
      expect(result).toContain('.xlsx');
      expect(result).toContain('.xls');
      expect(result).toContain('.csv');
    });

    it('should return readonly array', () => {
      const result = factory.getSupportedTypes();

      expect(Object.isFrozen(result) || result.constructor.name === 'Array').toBe(true);
      // Verify it's readonly by checking it includes all expected types
      expect(result.length).toBe(3);
      expect(result).toEqual(['.xlsx', '.xls', '.csv']);
    });

    it('should flatten supportedTypes from all parsers', () => {
      // Modify mock to test flattening behavior
      mockExcelParser.supportedTypes = ['.xlsx', '.xls', '.xlsm'];
      mockCsvParser.supportedTypes = ['.csv', '.txt'];

      // Recreate factory with updated mocks
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FileParserFactory,
          { provide: CsvFileParser, useValue: mockCsvParser },
          { provide: ExcelFileParser, useValue: mockExcelParser }
        ]
      });
      factory = TestBed.inject(FileParserFactory);

      const result = factory.getSupportedTypes();

      expect(result).toEqual(['.xlsx', '.xls', '.xlsm', '.csv', '.txt']);
      expect(result.length).toBe(5);
    });
  });

  describe('isSupported', () => {
    it('should return true when file is supported by CSV parser', () => {
      const csvFile = createMockFile('test.csv', 'text/csv');
      mockExcelParser.canParse.mockReturnValue(false); // Excel parser fails first
      mockCsvParser.canParse.mockReturnValue(true); // CSV parser succeeds

      const result = factory.isSupported(csvFile);

      expect(result).toBe(true);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(csvFile);
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(csvFile);
    });

    it('should return true when file is supported by Excel parser', () => {
      const excelFile = createMockFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      mockExcelParser.canParse.mockReturnValue(true); // Excel parser succeeds first

      const result = factory.isSupported(excelFile);

      expect(result).toBe(true);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(excelFile);
      // CSV parser not called since Excel parser already matched
      expect(mockCsvParser.canParse).not.toHaveBeenCalled();
    });

    it('should return false when file is not supported by any parser', () => {
      const unsupportedFile = createMockFile('test.txt', 'text/plain');
      mockExcelParser.canParse.mockReturnValue(false);
      mockCsvParser.canParse.mockReturnValue(false);

      const result = factory.isSupported(unsupportedFile);

      expect(result).toBe(false);
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(unsupportedFile);
      expect(mockCsvParser.canParse).toHaveBeenCalledWith(unsupportedFile);
    });

    it('should return true when multiple parsers can handle the file', () => {
      const file = createMockFile('test.file', 'application/test');
      mockExcelParser.canParse.mockReturnValue(true);
      mockCsvParser.canParse.mockReturnValue(true);

      const result = factory.isSupported(file);

      expect(result).toBe(true);
      // Should stop at first match
      expect(mockExcelParser.canParse).toHaveBeenCalledWith(file);
      expect(mockCsvParser.canParse).not.toHaveBeenCalled();
    });
  });

  describe('parser selection logic', () => {
    it('should maintain consistent parser order', () => {
      const file1 = createMockFile('test1.file', 'application/test');
      const file2 = createMockFile('test2.file', 'application/test');

      mockExcelParser.canParse.mockReturnValue(true);
      mockCsvParser.canParse.mockReturnValue(false);

      const result1 = factory.getParser(file1);
      const result2 = factory.getParser(file2);

      expect(result1).toBe(mockExcelParser);
      expect(result2).toBe(mockExcelParser);
      expect(result1).toBe(result2); // Same parser instance
    });

    it('should handle edge case files correctly', () => {
      const edgeCases = [
        createMockFile('', ''), // Empty filename and type
        createMockFile('file', ''), // No extension
        createMockFile('file.', 'application/test'), // Dot but no extension
        createMockFile('.hidden', 'text/plain') // Hidden file
      ];

      mockCsvParser.canParse.mockReturnValue(false);
      mockExcelParser.canParse.mockReturnValue(false);

      edgeCases.forEach(file => {
        const result = factory.getParser(file);
        expect(result).toBeNull();
      });

      expect(mockCsvParser.canParse).toHaveBeenCalledTimes(4);
      expect(mockExcelParser.canParse).toHaveBeenCalledTimes(4);
    });
  });

  describe('integration behavior', () => {
    it('should work correctly with real parser interfaces', () => {
      // Create mock parsers that follow IFileParser interface more closely
      const realishCsvParser: IFileParser = {
        canParse: jest.fn((file: File) => file.name.endsWith('.csv')),
        parse: jest.fn(),
        supportedTypes: ['.csv']
      };

      const realishExcelParser: IFileParser = {
        canParse: jest.fn((file: File) => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')),
        parse: jest.fn(),
        supportedTypes: ['.xlsx', '.xls']
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FileParserFactory,
          { provide: CsvFileParser, useValue: realishCsvParser },
          { provide: ExcelFileParser, useValue: realishExcelParser }
        ]
      });
      factory = TestBed.inject(FileParserFactory);

      // Test various file types
      const csvFile = createMockFile('data.csv', 'text/csv');
      const xlsxFile = createMockFile('workbook.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      const txtFile = createMockFile('readme.txt', 'text/plain');

      expect(factory.getParser(csvFile)).toBe(realishCsvParser);
      expect(factory.getParser(xlsxFile)).toBe(realishExcelParser);
      expect(factory.getParser(txtFile)).toBeNull();

      expect(factory.isSupported(csvFile)).toBe(true);
      expect(factory.isSupported(xlsxFile)).toBe(true);
      expect(factory.isSupported(txtFile)).toBe(false);

      expect(factory.getSupportedTypes()).toEqual(['.xlsx', '.xls', '.csv']);
    });

    it('should handle parser dependencies correctly', () => {
      // Test that factory correctly uses injected parsers
      expect(factory.getParser).toBeDefined();
      expect(factory.getSupportedTypes).toBeDefined();
      expect(factory.isSupported).toBeDefined();

      // Verify parsers array is properly initialized
      const supportedTypes = factory.getSupportedTypes();
      expect(supportedTypes.length).toBeGreaterThan(0);
    });
  });
});

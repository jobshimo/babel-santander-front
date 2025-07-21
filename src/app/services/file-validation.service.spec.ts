import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_FILE_VALIDATION_CONFIG,
  FILE_ERROR_KEYS,
  ProcessedRowData
} from '../models/file-parser.model';
import { FileValidationService } from './file-validation.service';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileValidationService]
    });

    service = TestBed.inject(FileValidationService);
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateRowCount', () => {
    it('should return invalid with EMPTY error when row count is 0', () => {
      const result = service.validateRowCount(0);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.EMPTY]);
    });

    it('should return invalid with INVALID_ROWS error when exceeding max rows', () => {
      const maxRows = DEFAULT_FILE_VALIDATION_CONFIG.maxRows;
      const result = service.validateRowCount(maxRows + 1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_ROWS]);
    });

    it('should return valid when row count is within limits', () => {
      const validRowCount = DEFAULT_FILE_VALIDATION_CONFIG.maxRows;
      const result = service.validateRowCount(validRowCount);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid when row count equals min rows', () => {
      const minRows = DEFAULT_FILE_VALIDATION_CONFIG.minRows;
      const result = service.validateRowCount(minRows);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('validateRowData', () => {
    const createValidRowData = (): ProcessedRowData => ({
      seniority: 'junior',
      yearsOfExperience: 3,
      availability: true
    });

    it('should return valid for valid row data', () => {
      const validData = createValidRowData();
      const result = service.validateRowData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid with INVALID_SENIORITY error for invalid seniority', () => {
      const invalidData = { ...createValidRowData(), seniority: 'invalid' };
      const result = service.validateRowData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
    });

    it('should return invalid with INVALID_EXPERIENCE error for invalid years', () => {
      const invalidData = { ...createValidRowData(), yearsOfExperience: 'invalid' };
      const result = service.validateRowData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
    });

    it('should return invalid with INVALID_AVAILABILITY error for invalid availability', () => {
      const invalidData = { ...createValidRowData(), availability: 'maybe' as any };
      const result = service.validateRowData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      const invalidData: ProcessedRowData = {
        seniority: 'invalid',
        yearsOfExperience: 'not-a-number',
        availability: 'maybe' as any
      };
      const result = service.validateRowData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
    });

    it('should validate senior seniority as valid', () => {
      const data = { ...createValidRowData(), seniority: 'senior' };
      const result = service.validateRowData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate negative years as invalid', () => {
      const data = { ...createValidRowData(), yearsOfExperience: -1 };
      const result = service.validateRowData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
    });
  });

  describe('validateColumnCount', () => {
    it('should return valid when column count matches required columns', () => {
      const expectedCount = DEFAULT_FILE_VALIDATION_CONFIG.requiredColumns.length;
      const result = service.validateColumnCount(expectedCount);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid when column count is less than required', () => {
      const expectedCount = DEFAULT_FILE_VALIDATION_CONFIG.requiredColumns.length;
      const result = service.validateColumnCount(expectedCount - 1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_COLUMNS]);
    });

    it('should return invalid when column count is more than required', () => {
      const expectedCount = DEFAULT_FILE_VALIDATION_CONFIG.requiredColumns.length;
      const result = service.validateColumnCount(expectedCount + 1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_COLUMNS]);
    });
  });

  describe('validateHeaders', () => {
    it('should return valid for correct headers', () => {
      const validHeaders = ['seniority', 'yearsOfExperience', 'availability'];
      const result = service.validateHeaders(validHeaders);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid for correct headers with different case', () => {
      const validHeaders = ['SENIORITY', 'YearsOfExperience', 'availability'];
      const result = service.validateHeaders(validHeaders);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid for correct headers with extra whitespace', () => {
      const validHeaders = [' seniority ', '  yearsOfExperience', 'availability '];
      const result = service.validateHeaders(validHeaders);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return valid for correct headers in different order', () => {
      const validHeaders = ['availability', 'seniority', 'yearsOfExperience'];
      const result = service.validateHeaders(validHeaders);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid when missing required headers', () => {
      const invalidHeaders = ['seniority', 'yearsOfExperience']; // Missing 'availability'
      const result = service.validateHeaders(invalidHeaders);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_COLUMNS]);
    });

    it('should return invalid when headers are completely different', () => {
      const invalidHeaders = ['name', 'age', 'email'];
      const result = service.validateHeaders(invalidHeaders);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_COLUMNS]);
    });

    it('should return invalid for empty headers array', () => {
      const result = service.validateHeaders([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([FILE_ERROR_KEYS.INVALID_COLUMNS]);
    });
  });

  describe('normalizeRowData', () => {
    it('should normalize seniority to lowercase', () => {
      const data: ProcessedRowData = {
        seniority: 'JUNIOR',
        yearsOfExperience: 3,
        availability: true
      };

      const result = service.normalizeRowData(data);

      expect(result.seniority).toBe('junior');
    });

    it('should normalize seniority with whitespace', () => {
      const data: ProcessedRowData = {
        seniority: '  Senior  ',
        yearsOfExperience: 5,
        availability: false
      };

      const result = service.normalizeRowData(data);

      expect(result.seniority).toBe('senior');
    });

    it('should convert string years to number', () => {
      const data: ProcessedRowData = {
        seniority: 'junior',
        yearsOfExperience: '7',
        availability: true
      };

      const result = service.normalizeRowData(data);

      expect(result.yearsOfExperience).toBe(7);
      expect(typeof result.yearsOfExperience).toBe('number');
    });

    it('should preserve numeric years of experience', () => {
      const data: ProcessedRowData = {
        seniority: 'senior',
        yearsOfExperience: 10,
        availability: false
      };

      const result = service.normalizeRowData(data);

      expect(result.yearsOfExperience).toBe(10);
      expect(typeof result.yearsOfExperience).toBe('number');
    });

    it('should convert string years with whitespace to number', () => {
      const data: ProcessedRowData = {
        seniority: 'junior',
        yearsOfExperience: '  4  ',
        availability: true
      };

      const result = service.normalizeRowData(data);

      expect(result.yearsOfExperience).toBe(4);
    });

    it('should return -1 for invalid string years', () => {
      const data: ProcessedRowData = {
        seniority: 'senior',
        yearsOfExperience: 'invalid',
        availability: false
      };

      const result = service.normalizeRowData(data);

      expect(result.yearsOfExperience).toBe(-1);
    });

    it('should preserve boolean availability', () => {
      const data: ProcessedRowData = {
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(true);
      expect(typeof result.availability).toBe('boolean');
    });

    it('should convert string "true" to boolean true', () => {
      const data: ProcessedRowData = {
        seniority: 'senior',
        yearsOfExperience: 8,
        availability: 'true'
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(true);
      expect(typeof result.availability).toBe('boolean');
    });

    it('should convert string "false" to boolean false', () => {
      const data: ProcessedRowData = {
        seniority: 'junior',
        yearsOfExperience: 1,
        availability: 'false'
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(false);
      expect(typeof result.availability).toBe('boolean');
    });

    it('should convert string "TRUE" to boolean true (case insensitive)', () => {
      const data: ProcessedRowData = {
        seniority: 'senior',
        yearsOfExperience: 6,
        availability: 'TRUE'
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(true);
    });

    it('should convert string with whitespace to boolean correctly', () => {
      const data: ProcessedRowData = {
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: '  false  '
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(false);
    });

    it('should convert invalid string availability to false', () => {
      const data: ProcessedRowData = {
        seniority: 'senior',
        yearsOfExperience: 4,
        availability: 'maybe'
      };

      const result = service.normalizeRowData(data);

      expect(result.availability).toBe(false);
    });
  });

  describe('private method behavior through public methods', () => {
    describe('seniority validation', () => {
      it('should accept valid seniority values from config', () => {
        const validSeniorityValues = DEFAULT_FILE_VALIDATION_CONFIG.supportedSeniorityValues;

        validSeniorityValues.forEach(seniority => {
          const data: ProcessedRowData = {
            seniority,
            yearsOfExperience: 1,
            availability: true
          };

          const result = service.validateRowData(data);
          expect(result.errors).not.toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
        });
      });

      it('should reject seniority values not in config', () => {
        const invalidSeniority = 'intermediate'; // Not in supportedSeniorityValues
        const data: ProcessedRowData = {
          seniority: invalidSeniority,
          yearsOfExperience: 1,
          availability: true
        };

        const result = service.validateRowData(data);
        expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_SENIORITY);
      });
    });

    describe('years of experience validation', () => {
      it('should accept zero years of experience', () => {
        const data: ProcessedRowData = {
          seniority: 'junior',
          yearsOfExperience: 0,
          availability: true
        };

        const result = service.validateRowData(data);
        expect(result.errors).not.toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
      });

      it('should reject negative years of experience', () => {
        const data: ProcessedRowData = {
          seniority: 'junior',
          yearsOfExperience: -5,
          availability: true
        };

        const result = service.validateRowData(data);
        expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
      });

      it('should reject NaN years of experience', () => {
        const data: ProcessedRowData = {
          seniority: 'senior',
          yearsOfExperience: NaN,
          availability: true
        };

        const result = service.validateRowData(data);
        expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_EXPERIENCE);
      });
    });

    describe('availability validation', () => {
      it('should accept boolean true', () => {
        const data: ProcessedRowData = {
          seniority: 'junior',
          yearsOfExperience: 2,
          availability: true
        };

        const result = service.validateRowData(data);
        expect(result.errors).not.toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
      });

      it('should accept boolean false', () => {
        const data: ProcessedRowData = {
          seniority: 'senior',
          yearsOfExperience: 5,
          availability: false
        };

        const result = service.validateRowData(data);
        expect(result.errors).not.toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
      });

      it('should accept string "true" and "false"', () => {
        const trueData: ProcessedRowData = {
          seniority: 'junior',
          yearsOfExperience: 1,
          availability: 'true'
        };

        const falseData: ProcessedRowData = {
          seniority: 'senior',
          yearsOfExperience: 3,
          availability: 'false'
        };

        const trueResult = service.validateRowData(trueData);
        const falseResult = service.validateRowData(falseData);

        expect(trueResult.errors).not.toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
        expect(falseResult.errors).not.toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
      });

      it('should reject invalid availability values', () => {
        const invalidValues = ['yes', 'no', 'maybe', '1', '0', '', 'null'];

        invalidValues.forEach(invalidValue => {
          const data: ProcessedRowData = {
            seniority: 'junior',
            yearsOfExperience: 2,
            availability: invalidValue as any
          };

          const result = service.validateRowData(data);
          expect(result.errors).toContain(FILE_ERROR_KEYS.INVALID_AVAILABILITY);
        });
      });
    });
  });
});

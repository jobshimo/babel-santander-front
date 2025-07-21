import { TestBed } from '@angular/core/testing';
import { FileData } from '../models/candidate.model';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileService]
    });
    service = TestBed.inject(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseCSVFile', () => {
    it('should parse valid CSV file with junior seniority', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,true';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: (result: FileData) => {
          expect(result.seniority).toBe('junior');
          expect(result.yearsOfExperience).toBe(3);
          expect(result.availability).toBe(true);
          done();
        },
        error: (error) => {
          fail(error.message);
        }
      });
    });

    it('should parse valid CSV file with senior seniority', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\nsenior,8,false';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: (result: FileData) => {
          expect(result.seniority).toBe('senior');
          expect(result.yearsOfExperience).toBe(8);
          expect(result.availability).toBe(false);
          done();
        },
        error: (error) => {
          fail(error);
        }
      });
    });

    it('should reject CSV with invalid seniority value', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\nmiddle,3,true';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for invalid seniority');
        },
        error: (error) => {
          expect(error.message).toContain('seniority debe ser "junior" o "senior"');
          done();
        }
      });
    });

    it('should reject CSV with invalid years of experience', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,invalid,true';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for invalid yearsOfExperience');
        },
        error: (error) => {
          expect(error.message).toContain('yearsOfExperience debe ser un número positivo');
          done();
        }
      });
    });

    it('should reject CSV with invalid availability value', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,maybe';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for invalid availability');
        },
        error: (error) => {
          expect(error.message).toContain('availability debe ser "true" o "false"');
          done();
        }
      });
    });

    it('should reject CSV with missing required columns', (done) => {
      const csvContent = 'seniority,yearsOfExperience\njunior,3';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for missing columns');
        },
        error: (error) => {
          expect(error.message).toContain('debe contener exactamente 3 columnas');
          done();
        }
      });
    });

    it('should reject CSV with multiple data rows', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,true\nsenior,5,false';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for multiple data rows');
        },
        error: (error) => {
          expect(error.message).toContain('debe contener exactamente una fila de datos (puede incluir');
          done();
        }
      });
    });

    it('should reject CSV with no data rows', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for invalid seniority value');
        },
        error: (error) => {
          expect(error.message).toContain('seniority debe ser "junior" o "senior"');
          done();
        }
      });
    });

    it('should reject CSV with negative years of experience', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,-1,true';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for negative yearsOfExperience');
        },
        error: (error) => {
          expect(error.message).toContain('yearsOfExperience debe ser un número positivo');
          done();
        }
      });
    });

    it('should parse CSV file without headers', (done) => {
      const csvContent = 'senior,7,false';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: (result: FileData) => {
          expect(result.seniority).toBe('senior');
          expect(result.yearsOfExperience).toBe(7);
          expect(result.availability).toBe(false);
          done();
        },
        error: (error) => {
          fail(error.message);
        }
      });
    });

    it('should reject CSV without headers if wrong number of columns', (done) => {
      const csvContent = 'senior,7';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have thrown an error for wrong number of columns');
        },
        error: (error) => {
          expect(error.message).toContain('debe contener exactamente 3 columnas');
          done();
        }
      });
    });
  });
});

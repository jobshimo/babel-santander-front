import { TestBed } from '@angular/core/testing';
import { FileData } from '../models/employee.model';
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
    it('should parse valid CSV file', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,true';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: (result: FileData) => {
          expect(result.seniority).toBe('junior');
          expect(result.yearsOfExperience).toBe(3);
          expect(result.availability).toBe(true);
          done();
        },
        error: (error) => {
          fail('Should not have errored: ' + error.message);
        }
      });
    });

    it('should handle senior seniority', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\nsenior,8,false';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: (result: FileData) => {
          expect(result.seniority).toBe('senior');
          expect(result.yearsOfExperience).toBe(8);
          expect(result.availability).toBe(false);
          done();
        },
        error: (error) => {
          fail('Should not have errored: ' + error.message);
        }
      });
    });

    it('should reject invalid seniority', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\nmiddle,3,true';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have errored');
        },
        error: (error) => {
          expect(error.message).toContain('seniority debe ser "junior" o "senior"');
          done();
        }
      });
    });

    it('should reject invalid yearsOfExperience', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,invalid,true';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have errored');
        },
        error: (error) => {
          expect(error.message).toContain('yearsOfExperience debe ser un número positivo');
          done();
        }
      });
    });

    it('should reject invalid availability', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,maybe';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have errored');
        },
        error: (error) => {
          expect(error.message).toContain('availability debe ser "true" o "false"');
          done();
        }
      });
    });

    it('should reject missing columns', (done) => {
      const csvContent = 'seniority,yearsOfExperience\njunior,3';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have errored');
        },
        error: (error) => {
          expect(error.message).toContain('debe contener las columnas: seniority, yearsOfExperience, availability');
          done();
        }
      });
    });

    it('should reject multiple data rows', (done) => {
      const csvContent = 'seniority,yearsOfExperience,availability\njunior,3,true\nsenior,5,false';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'test.csv', { type: 'text/csv' });

      service.parseCSVFile(file).subscribe({
        next: () => {
          fail('Should have errored');
        },
        error: (error) => {
          expect(error.message).toContain('debe contener exactamente una fila de datos');
          done();
        }
      });
    });
  });
});

import { Employee, EmployeeResponse, FileData } from './employee.model';

describe('Employee Models', () => {
  describe('Employee', () => {
    it('should create an employee instance', () => {
      const employee: Employee = {
        nombre: 'Juan',
        apellido: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true
      };

      expect(employee).toBeTruthy();
      expect(employee.nombre).toBe('Juan');
      expect(employee.apellido).toBe('Pérez');
      expect(employee.seniority).toBe('junior');
      expect(employee.yearsOfExperience).toBe(2);
      expect(employee.availability).toBe(true);
    });

    it('should accept senior seniority', () => {
      const employee: Employee = {
        nombre: 'Ana',
        apellido: 'García',
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      };

      expect(employee.seniority).toBe('senior');
    });
  });

  describe('EmployeeResponse', () => {
    it('should create an employee response instance', () => {
      const response: EmployeeResponse = {
        id: '123',
        nombre: 'Juan',
        apellido: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true,
        timestamp: new Date()
      };

      expect(response).toBeTruthy();
      expect(response.id).toBe('123');
      expect(response.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('FileData', () => {
    it('should create a file data instance', () => {
      const fileData: FileData = {
        seniority: 'senior',
        yearsOfExperience: 7,
        availability: true
      };

      expect(fileData).toBeTruthy();
      expect(fileData.seniority).toBe('senior');
      expect(fileData.yearsOfExperience).toBe(7);
      expect(fileData.availability).toBe(true);
    });
  });
});

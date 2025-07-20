import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Employee, EmployeeResponse } from '../models/employee.model';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should submit employee data successfully', () => {
    const mockEmployee: Employee = {
      nombre: 'Juan',
      apellido: 'Pérez',
      seniority: 'junior',
      yearsOfExperience: 2,
      availability: true
    };

    const mockResponse: EmployeeResponse = {
      id: '123',
      ...mockEmployee
    };

    service.submitEmployee(mockEmployee).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.nombre).toBe(mockEmployee.nombre);
      expect(response.apellido).toBe(mockEmployee.apellido);
      expect(response.seniority).toBe(mockEmployee.seniority);
      expect(response.yearsOfExperience).toBe(mockEmployee.yearsOfExperience);
      expect(response.availability).toBe(mockEmployee.availability);
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/employees');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockEmployee);

    req.flush(mockResponse);
  });

  it('should handle error and return mock response', () => {
    const mockEmployee: Employee = {
      nombre: 'Juan',
      apellido: 'Pérez',
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: false
    };

    service.submitEmployee(mockEmployee).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.nombre).toBe(mockEmployee.nombre);
      expect(response.apellido).toBe(mockEmployee.apellido);
      expect(response.id).toBeTruthy();
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/employees');
    expect(req.request.method).toBe('POST');

    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should validate employee data types', () => {
    const employee: Employee = {
      nombre: 'Ana',
      apellido: 'García',
      seniority: 'senior',
      yearsOfExperience: 10,
      availability: true
    };

    expect(typeof employee.nombre).toBe('string');
    expect(typeof employee.apellido).toBe('string');
    expect(['junior', 'senior']).toContain(employee.seniority);
    expect(typeof employee.yearsOfExperience).toBe('number');
    expect(typeof employee.availability).toBe('boolean');
  });
});

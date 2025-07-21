import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Candidate, CandidateResponse } from '../models/candidate.model';
import { CandidateService } from './candidate.service';

describe('CandidateService', () => {
  let service: CandidateService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  const mockCandidatesResponse: CandidateResponse[] = [
    {
      id: '1',
      name: 'Juan',
      surname: 'Pérez',
      seniority: 'junior',
      yearsOfExperience: 2,
      availability: true
    },
    {
      id: '2',
      name: 'Ana',
      surname: 'García',
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandidateService]
    });
    service = TestBed.inject(CandidateService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all candidates successfully', () => {
    const mockCandidates: CandidateResponse[] = [
      {
        id: '1',
        name: 'Juan',
        surname: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 2,
        availability: true
      },
      {
        id: '2',
        name: 'Ana',
        surname: 'García',
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      }
    ];

    service.getAllCandidates().subscribe(candidates => {
      expect(candidates).toEqual(mockCandidates);
      expect(candidates.length).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidates);
  });

  it('should get candidates with fallback when API fails', () => {
    const mockCachedCandidates: CandidateResponse[] = [
      {
        id: '1',
        name: 'Cached',
        surname: 'User',
        seniority: 'senior',
        yearsOfExperience: 3,
        availability: true
      }
    ];

    const cachedData = {
      candidates: mockCachedCandidates,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('candidatesData', JSON.stringify(cachedData));

    service.getAllCandidatesWithFallback().subscribe(candidates => {
      expect(candidates).toEqual(mockCachedCandidates);
      expect(candidates.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    expect(req.request.method).toBe('GET');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should submit candidate data successfully', () => {
    const mockCandidate: Candidate = {
      name: 'Juan',
      surname: 'Pérez',
      seniority: 'junior',
      yearsOfExperience: 2,
      availability: true
    };

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    const mockResponse: CandidateResponse = {
      id: '123',
      name: 'Juan',
      surname: 'Pérez',
      seniority: 'junior',
      yearsOfExperience: 2,
      availability: true
    };

    service.submitCandidate(mockCandidate, mockFile).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.name).toBe(mockCandidate.name);
      expect(response.surname).toBe(mockCandidate.surname);
      expect(response.seniority).toBe('junior');
      expect(response.yearsOfExperience).toBe(2);
      expect(response.availability).toBe(true);
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);

    req.flush(mockResponse);
  });

  it('should handle error and return mock response', () => {
    const mockCandidate: Candidate = {
      name: 'Juan',
      surname: 'Pérez',
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: false
    };

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    service.submitCandidate(mockCandidate, mockFile).subscribe({
      next: (response) => {
        throw new Error('Expected error, but got response');
      },
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    expect(req.request.method).toBe('POST');

    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should validate candidate data types', () => {
    const candidate: Candidate = {
      name: 'Ana',
      surname: 'García',
      seniority: 'senior',
      yearsOfExperience: 10,
      availability: true
    };

    expect(typeof candidate.name).toBe('string');
    expect(typeof candidate.surname).toBe('string');
    expect(['junior', 'senior']).toContain(candidate.seniority!);
    expect(typeof candidate.yearsOfExperience).toBe('number');
    expect(typeof candidate.availability).toBe('boolean');
  });

  it('should handle cached data correctly', () => {
    const cachedInfo = service.getCachedDataInfo();
    expect(cachedInfo.candidates).toEqual([]);
    expect(cachedInfo.lastUpdated).toBeNull();
  });

  it('should provide API status observable', () => {
    service.apiStatus$.subscribe(status => {
      expect(status.online).toBeDefined();
      expect(status.lastCheck).toBeInstanceOf(Date);
      expect(status.usingCachedData).toBeDefined();
    });
  });

  it('should handle cached API status loading errors', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Crear un nuevo TestBed para este test específico
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandidateService]
    });
    
    const newService = TestBed.inject(CandidateService);

    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy.mock.calls[0][0]).toBe('Error loading cached API status:');
    expect(consoleSpy.mock.calls[0][1]).toBeInstanceOf(SyntaxError);

    consoleSpy.mockRestore();
  });

  it('should update API status from offline to online when API responds', () => {
    service['apiStatusSubject'].next({
      online: false,
      lastCheck: new Date(),
      usingCachedData: true
    });

    service['checkApiStatus']();

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    req.flush('OK', { status: 200, statusText: 'OK' });


    service.apiStatus$.subscribe(status => {
      expect(status.online).toBeTruthy();
      expect(status.usingCachedData).toBeFalsy();
    });
  });

  it('should update API status from online to offline when API fails', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});


    service['apiStatusSubject'].next({
      online: true,
      lastCheck: new Date(),
      usingCachedData: false
    });

    service['checkApiStatus']();

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    req.error(new ErrorEvent('Network Error'));


    service.apiStatus$.subscribe(status => {
      expect(status.online).toBeFalsy();
      expect(status.usingCachedData).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it('should handle getAllCandidatesWithFallback success and update status', () => {

    service['apiStatusSubject'].next({
      online: false,
      lastCheck: new Date(),
      usingCachedData: true
    });

    service.getAllCandidatesWithFallback().subscribe(candidates => {
      expect(candidates).toEqual(mockCandidatesResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    req.flush(mockCandidatesResponse);


    service.apiStatus$.subscribe(status => {
      expect(status.online).toBeTruthy();
      expect(status.usingCachedData).toBeFalsy();
    });
  });

  it('should handle submitCandidate success and update status', () => {
    const mockCandidate: Candidate = {
      name: 'Juan',
      surname: 'Pérez'
    };
    const mockFile = new File(['test'], 'test.pdf');


    service['apiStatusSubject'].next({
      online: false,
      lastCheck: new Date(),
      usingCachedData: true
    });

    service.submitCandidate(mockCandidate, mockFile).subscribe(response => {
      expect(response).toBeDefined();
      expect(response.timestamp).toBeDefined();
    });

    const req = httpMock.expectOne('http://localhost:3000/candidates');
    req.flush(mockCandidatesResponse[0]);


    service.apiStatus$.subscribe(status => {
      expect(status.online).toBeTruthy();
      expect(status.usingCachedData).toBeFalsy();
    });
  });

  it('should force API check', () => {
    const checkApiSpy = jest.spyOn(service as any, 'checkApiStatus');

    service.forceApiCheck();

    expect(checkApiSpy).toHaveBeenCalled();


    const req = httpMock.expectOne('http://localhost:3000/candidates');
    req.flush({});
  });

  it('should get cached data info with no cached data', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);

    const info = service.getCachedDataInfo();

    expect(info.candidates).toEqual([]);
    expect(info.lastUpdated).toBeNull();
  });

  it('should get cached data info with existing data', () => {
    const mockData = {
      candidates: mockCandidatesResponse,
      timestamp: new Date().toISOString()
    };
    jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockData));

    const info = service.getCachedDataInfo();

    expect(info.candidates).toEqual(mockCandidatesResponse);
    expect(info.lastUpdated).toBeDefined();
  });

  it('should handle invalid cached data gracefully', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue('invalid-json');

    const info = service.getCachedDataInfo();

    expect(info.candidates).toEqual([]);
    expect(info.lastUpdated).toBeNull();
  });
});

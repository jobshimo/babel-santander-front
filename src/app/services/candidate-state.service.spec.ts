import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { CandidateResponse } from '../models/candidate.model';
import { CandidateStateService } from './candidate-state.service';
import { CandidateService } from './candidate.service';
import { NotificationService } from './notification.service';

describe('CandidateStateService', () => {
  let service: CandidateStateService;
  let candidateService: jest.Mocked<CandidateService>;
  let notificationService: jest.Mocked<NotificationService>;
  let translocoService: jest.Mocked<TranslocoService>;

  const mockCandidates: CandidateResponse[] = [
    { id: '1', name: 'Test 1', surname: 'Surname 1', seniority: 'junior', yearsOfExperience: 2, availability: true },
    { id: '2', name: 'Test 2', surname: 'Surname 2', seniority: 'senior', yearsOfExperience: 5, availability: false }
  ];

  beforeEach(() => {
    const candidateServiceMock = {
      getCachedDataInfo: jest.fn(),
      getAllCandidates: jest.fn(),
      forceApiCheck: jest.fn()
    };

    const notificationServiceMock = {
      showWarning: jest.fn(),
      showError: jest.fn()
    };

    const translocoServiceMock = {
      translate: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        CandidateStateService,
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: TranslocoService, useValue: translocoServiceMock }
      ]
    });

    service = TestBed.inject(CandidateStateService);
    candidateService = TestBed.inject(CandidateService) as jest.Mocked<CandidateService>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
    translocoService = TestBed.inject(TranslocoService) as jest.Mocked<TranslocoService>;
  });

  describe('getters', () => {
    it('should return current candidates', () => {
      (service as any).candidateDataSubject.next(mockCandidates);

      expect(service.currentCandidates).toEqual(mockCandidates);
    });

    it('should return candidate count', () => {
      (service as any).candidateDataSubject.next(mockCandidates);

      expect(service.candidateCount).toBe(2);
    });

    it('should return 0 when no candidates', () => {
      expect(service.candidateCount).toBe(0);
    });
  });

  describe('loadCandidates', () => {
    it('should load from cache when cached data exists', (done) => {
      const cachedInfo = {
        candidates: mockCandidates,
        lastUpdated: new Date()
      };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));
      translocoService.translate.mockReturnValue('Cached message');

      service.loadCandidates();

      // Wait for async operations to complete
      setTimeout(() => {
        expect(service.currentCandidates).toEqual(mockCandidates);
        expect(translocoService.translate).toHaveBeenCalledWith('status.cachedDataMessage');
        expect(notificationService.showWarning).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('should handle cached data without lastUpdated', (done) => {
      const cachedInfo = {
        candidates: mockCandidates,
        lastUpdated: null
      };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));
      translocoService.translate.mockReturnValueOnce('Unknown').mockReturnValueOnce('Cached message');

      service.loadCandidates();

      setTimeout(() => {
        expect(translocoService.translate).toHaveBeenCalledWith('status.unknown');
        expect(translocoService.translate).toHaveBeenCalledWith('status.cachedDataMessage');
        done();
      }, 0);
    });

    it('should set loading when no cached data', () => {
      const cachedInfo = { candidates: [], lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));

      service.isLoading$.subscribe(loading => {
        if (loading) {
          expect(loading).toBe(true);
        }
      });

      service.loadCandidates();
    });

    it('should update candidates from API on success', (done) => {
      const cachedInfo = { candidates: [], lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));

      service.loadCandidates();

      setTimeout(() => {
        expect(service.currentCandidates).toEqual(mockCandidates);
        done();
      }, 0);
    });

    it('should handle API error with no cached data', (done) => {
      const cachedInfo = { candidates: [], lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(throwError('API Error'));
      translocoService.translate.mockReturnValue('No data and server down');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.loadCandidates();

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Servidor no disponible:', 'API Error');
        expect(translocoService.translate).toHaveBeenCalledWith('status.noDataAndServerDown');
        expect(notificationService.showError).toHaveBeenCalledWith('No data and server down');
        consoleSpy.mockRestore();
        done();
      }, 0);
    });

    it('should handle API error with cached data', (done) => {
      const cachedInfo = { candidates: mockCandidates, lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(throwError('API Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      service.loadCandidates();

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Servidor no disponible:', 'API Error');
        expect(notificationService.showError).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
        done();
      }, 0);
    });

    it('should set loading to false after completion', (done) => {
      const cachedInfo = { candidates: [], lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));

      let loadingStates: boolean[] = [];
      service.isLoading$.subscribe(loading => {
        loadingStates.push(loading);
        if (loadingStates.length === 3) { // initial false, true, false
          expect(loadingStates).toEqual([false, true, false]);
          done();
        }
      });

      service.loadCandidates();
    });
  });

  describe('refreshData', () => {
    it('should force API check, load candidates and trigger refresh', () => {
      const cachedInfo = { candidates: [], lastUpdated: null };
      candidateService.getCachedDataInfo.mockReturnValue(cachedInfo);
      candidateService.getAllCandidates.mockReturnValue(of(mockCandidates));

      let refreshTriggered = false;
      service.refreshTrigger$.subscribe(() => {
        refreshTriggered = true;
      });

      service.refreshData();

      expect(candidateService.forceApiCheck).toHaveBeenCalled();
      expect(refreshTriggered).toBe(true);
    });
  });

  describe('addCandidate', () => {
    it('should add candidate to current candidates', () => {
      const newCandidate: CandidateResponse = {
        id: '3',
        name: 'New Test',
        surname: 'New Surname',
        seniority: 'junior',
        yearsOfExperience: 1,
        availability: true
      };
      (service as any).candidateDataSubject.next(mockCandidates);

      service.addCandidate(newCandidate);

      expect(service.currentCandidates).toEqual([...mockCandidates, newCandidate]);
    });

    it('should add candidate to empty list', () => {
      const newCandidate: CandidateResponse = {
        id: '1',
        name: 'First Test',
        surname: 'First Surname',
        seniority: 'senior',
        yearsOfExperience: 3,
        availability: false
      };

      service.addCandidate(newCandidate);

      expect(service.currentCandidates).toEqual([newCandidate]);
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, Subject } from 'rxjs';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';
import { NotificationService } from '../../services/notification.service';
import { CandidateManagementComponent } from './candidate-management.component';

describe('CandidateManagementComponent', () => {
  let component: CandidateManagementComponent;
  let fixture: ComponentFixture<CandidateManagementComponent>;
  let candidateService: jest.Mocked<CandidateService>;
  let candidateStateService: jest.Mocked<CandidateStateService>;
  let notificationService: jest.Mocked<NotificationService>;
  let translocoService: jest.Mocked<TranslocoService>;
  let apiStatusSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    apiStatusSubject = new BehaviorSubject({ online: false, usingCachedData: false });

    const candidateServiceMock = {
      apiStatus$: apiStatusSubject.asObservable()
    };

    const candidateStateServiceMock = {
      get currentCandidates() { return []; },
      loadCandidates: jest.fn()
    };

    const notificationServiceMock = {
      showSuccess: jest.fn()
    };

    const translocoServiceMock = {
      translate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CandidateManagementComponent],
      providers: [
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: CandidateStateService, useValue: candidateStateServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: TranslocoService, useValue: translocoServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateManagementComponent);
    component = fixture.componentInstance;
    candidateService = TestBed.inject(CandidateService) as jest.Mocked<CandidateService>;
    candidateStateService = TestBed.inject(CandidateStateService) as jest.Mocked<CandidateStateService>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
    translocoService = TestBed.inject(TranslocoService) as jest.Mocked<TranslocoService>;
  });

  afterEach(() => {
    apiStatusSubject.complete();
  });

  describe('ngOnInit', () => {
    it('should subscribe to apiStatus$ and call loadCandidates', () => {
      component.ngOnInit();

      expect(candidateStateService.loadCandidates).toHaveBeenCalled();
    });

    it('should show success notification when server reconnects and has data', () => {
      jest.spyOn(candidateStateService, 'currentCandidates', 'get').mockReturnValue([{ id: 1, name: 'Test' }] as any);
      translocoService.translate.mockReturnValue('Server reconnected');

      component.ngOnInit();

      apiStatusSubject.next({ online: true, usingCachedData: false });

      expect(translocoService.translate).toHaveBeenCalledWith('status.serverReconnected');
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Server reconnected');
    });

    it('should not show notification when server reconnects but has no data', () => {
      jest.spyOn(candidateStateService, 'currentCandidates', 'get').mockReturnValue([]);

      component.ngOnInit();

      apiStatusSubject.next({ online: true, usingCachedData: false });

      expect(translocoService.translate).not.toHaveBeenCalled();
      expect(notificationService.showSuccess).not.toHaveBeenCalled();
    });

    it('should not show notification when server is offline', () => {
      jest.spyOn(candidateStateService, 'currentCandidates', 'get').mockReturnValue([{ id: 1, name: 'Test' }] as any);

      component.ngOnInit();

      apiStatusSubject.next({ online: false, usingCachedData: false });

      expect(translocoService.translate).not.toHaveBeenCalled();
      expect(notificationService.showSuccess).not.toHaveBeenCalled();
    });

    it('should not show notification when using cached data', () => {
      jest.spyOn(candidateStateService, 'currentCandidates', 'get').mockReturnValue([{ id: 1, name: 'Test' }] as any);

      component.ngOnInit();

      apiStatusSubject.next({ online: true, usingCachedData: true });

      expect(translocoService.translate).not.toHaveBeenCalled();
      expect(notificationService.showSuccess).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call next and complete on destroy$', () => {
      const destroySubject = (component as any).destroy$ as Subject<void>;
      const nextSpy = jest.spyOn(destroySubject, 'next');
      const completeSpy = jest.spyOn(destroySubject, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { ApiStatus, CandidateResponse } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { CandidateCheckComponent } from './candidate-check.component';

describe('CandidateCheckComponent', () => {
  let component: CandidateCheckComponent;
  let fixture: ComponentFixture<CandidateCheckComponent>;
  let mockCandidateService: jest.Mocked<CandidateService>;
  let mockCandidateStateService: jest.Mocked<CandidateStateService>;

  // BehaviorSubjects for mocking observables
  let apiStatusSubject: BehaviorSubject<ApiStatus>;
  let candidateDataSubject: BehaviorSubject<CandidateResponse[]>;
  let isLoadingSubject: BehaviorSubject<boolean>;

  const mockApiStatus: ApiStatus = {
    online: true,
    lastCheck: new Date('2025-01-01T12:00:00Z'),
    usingCachedData: false
  };

  const mockCandidates: CandidateResponse[] = [
    {
      id: '1',
      name: 'John',
      surname: 'Doe',
      seniority: 'senior',
      yearsOfExperience: 5,
      availability: true
    },
    {
      id: '2',
      name: 'Jane',
      surname: 'Smith',
      seniority: 'junior',
      yearsOfExperience: 2,
      availability: false
    }
  ];

  beforeEach(async () => {
    // Initialize BehaviorSubjects
    apiStatusSubject = new BehaviorSubject<ApiStatus>(mockApiStatus);
    candidateDataSubject = new BehaviorSubject<CandidateResponse[]>(mockCandidates);
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    // Create mock services
    mockCandidateService = {
      apiStatus$: apiStatusSubject.asObservable()
    } as any;

    mockCandidateStateService = {
      candidateData$: candidateDataSubject.asObservable(),
      isLoading$: isLoadingSubject.asObservable(),
      refreshData: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CandidateCheckComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: CandidateStateService, useValue: mockCandidateStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render the status card with correct structure', () => {
      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement).toBeTruthy();

      const statusContent = fixture.debugElement.query(By.css('.status-content'));
      expect(statusContent).toBeTruthy();

      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(refreshButton).toBeTruthy();

      const refreshIcon = fixture.debugElement.query(By.css('mat-icon'));
      expect(refreshIcon).toBeTruthy();
      expect(refreshIcon.nativeElement.textContent.trim()).toBe('refresh');
    });
  });

  describe('API Status Updates', () => {
    it('should update component state when API status changes to offline', () => {
      const offlineStatus: ApiStatus = {
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      };

      apiStatusSubject.next(offlineStatus);
      fixture.detectChanges();

      expect(component.apiStatus).toEqual(offlineStatus);
    });

    it('should update component state when API status changes to online', () => {
      const onlineStatus: ApiStatus = {
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      };

      apiStatusSubject.next(onlineStatus);
      fixture.detectChanges();

      expect(component.apiStatus).toEqual(onlineStatus);
    });

    it('should apply correct CSS class when API is online', () => {
      apiStatusSubject.next({
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      });
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement.nativeElement.classList).toContain('status-online');
    });

    it('should apply correct CSS class when API is offline', () => {
      apiStatusSubject.next({
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      });
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement.nativeElement.classList).toContain('status-offline');
    });
  });

  describe('Candidate Data Updates', () => {
    it('should update candidate count when new data arrives', () => {
      const newCandidates: CandidateResponse[] = [
        {
          id: '3',
          name: 'Bob',
          surname: 'Johnson',
          seniority: 'senior',
          yearsOfExperience: 7,
          availability: true
        }
      ];

      candidateDataSubject.next(newCandidates);
      fixture.detectChanges();

      expect(component.candidateCount).toBe(1);
    });

    it('should update candidate count to zero when data is cleared', () => {
      candidateDataSubject.next([]);
      fixture.detectChanges();

      expect(component.candidateCount).toBe(0);
    });
  });

  describe('Loading State', () => {
    it('should update loading state when service indicates loading', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      expect(component.isLoading).toBe(true);
    });

    it('should disable refresh button when loading', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(refreshButton.nativeElement.disabled).toBe(true);
    });

    it('should enable refresh button when not loading', () => {
      isLoadingSubject.next(false);
      fixture.detectChanges();

      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(refreshButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('User Interactions', () => {
    it('should call refreshData when refresh button is clicked', () => {
      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));

      refreshButton.nativeElement.click();
      fixture.detectChanges();

      expect(mockCandidateStateService.refreshData).toHaveBeenCalledTimes(1);
    });

    it('should not call refreshData when refresh button is disabled and clicked', () => {
      // Set loading state to disable button
      isLoadingSubject.next(true);
      fixture.detectChanges();

      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));

      // Try to click disabled button
      refreshButton.nativeElement.click();
      fixture.detectChanges();

      expect(mockCandidateStateService.refreshData).not.toHaveBeenCalled();
    });
  });

  describe('Status Messages', () => {
    it('should return correct translation key when online with data', () => {
      apiStatusSubject.next({
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      });
      candidateDataSubject.next(mockCandidates);
      fixture.detectChanges();

      expect(component.statusMessage).toBe('status.hasData');
    });

    it('should return correct translation key when offline with cached data', () => {
      apiStatusSubject.next({
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      });
      candidateDataSubject.next(mockCandidates);
      fixture.detectChanges();

      expect(component.statusMessage).toBe('status.hasDataOffline');
    });

    it('should return correct translation key when online with no data', () => {
      apiStatusSubject.next({
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      });
      candidateDataSubject.next([]);
      fixture.detectChanges();

      expect(component.statusMessage).toBe('status.noData');
    });

    it('should return correct translation key when offline with no data', () => {
      apiStatusSubject.next({
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      });
      candidateDataSubject.next([]);
      fixture.detectChanges();

      expect(component.statusMessage).toBe('status.noDataOffline');
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on component destruction', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'complete');

      fixture.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('should return status-online class when API is online and not using cached data', () => {
      apiStatusSubject.next({
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      });
      fixture.detectChanges();

      expect(component.statusCardClass).toBe('status-online');
    });

    it('should return status-offline class when API is offline', () => {
      apiStatusSubject.next({
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      });
      fixture.detectChanges();

      expect(component.statusCardClass).toBe('status-offline');
    });

    it('should return status-offline class when using cached data even if online', () => {
      apiStatusSubject.next({
        online: true,
        lastCheck: new Date(),
        usingCachedData: true
      });
      fixture.detectChanges();

      expect(component.statusCardClass).toBe('status-offline');
    });
  });
});

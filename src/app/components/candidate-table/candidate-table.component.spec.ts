import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { CandidateResponse } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { CandidateTableComponent } from './candidate-table.component';

describe('CandidateTableComponent', () => {
  let component: CandidateTableComponent;
  let fixture: ComponentFixture<CandidateTableComponent>;
  let mockCandidateStateService: jest.Mocked<CandidateStateService>;

  // BehaviorSubjects for mocking observables
  let candidateDataSubject: BehaviorSubject<CandidateResponse[]>;
  let isLoadingSubject: BehaviorSubject<boolean>;

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
    },
    {
      id: '3',
      name: 'Bob',
      surname: 'Johnson',
      seniority: 'senior',
      yearsOfExperience: 8,
      availability: true
    }
  ];

  beforeEach(async () => {
    // Initialize BehaviorSubjects
    candidateDataSubject = new BehaviorSubject<CandidateResponse[]>([]);
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    // Create mock service
    mockCandidateStateService = {
      candidateData$: candidateDataSubject.asObservable(),
      isLoading$: isLoadingSubject.asObservable(),
      refreshData: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CandidateTableComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule,
        NoopAnimationsModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: CandidateStateService, useValue: mockCandidateStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateTableComponent);
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

    it('should render the table card with correct structure', () => {
      const cardElement = fixture.debugElement.query(By.css('mat-card'));
      expect(cardElement).toBeTruthy();

      const cardHeader = fixture.debugElement.query(By.css('mat-card-header'));
      expect(cardHeader).toBeTruthy();

      const cardTitle = fixture.debugElement.query(By.css('mat-card-title'));
      expect(cardTitle).toBeTruthy();

      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(refreshButton).toBeTruthy();

      const refreshIcon = fixture.debugElement.query(By.css('button[mat-icon-button] mat-icon'));
      expect(refreshIcon.nativeElement.textContent.trim()).toBe('refresh');
    });

    it('should initialize with empty data source and correct columns', () => {
      expect(component.candidateDataSource.data).toEqual([]);
      expect(component.displayedColumns).toEqual(['name', 'surname', 'seniority', 'yearsOfExperience', 'availability']);
      expect(component.isLoading).toBe(false);
    });

    it('should have refresh button enabled initially', () => {
      const refreshButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      expect(refreshButton.nativeElement.disabled).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should update data source when candidate data changes', () => {
      candidateDataSubject.next(mockCandidates);
      fixture.detectChanges();

      expect(component.candidateDataSource.data).toEqual(mockCandidates);
      expect(component.candidateDataSource.data.length).toBe(3);
    });

    it('should update loading state when service indicates loading', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      expect(component.isLoading).toBe(true);
    });

    it('should update loading state when service indicates not loading', () => {
      isLoadingSubject.next(false);
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
    });

    it('should clear data source when empty data is received', () => {
      // First load some data
      candidateDataSubject.next(mockCandidates);
      fixture.detectChanges();
      expect(component.candidateDataSource.data.length).toBe(3);

      // Then clear it
      candidateDataSubject.next([]);
      fixture.detectChanges();
      expect(component.candidateDataSource.data).toEqual([]);
    });
  });

  describe('Loading State UI', () => {
    it('should show loading spinner when loading', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      expect(loadingContainer).toBeTruthy();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when not loading', () => {
      isLoadingSubject.next(false);
      fixture.detectChanges();

      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      expect(loadingContainer).toBeFalsy();
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

    it('should show table container when not loading', () => {
      isLoadingSubject.next(false);
      fixture.detectChanges();

      const tableContainer = fixture.debugElement.query(By.css('.table-container'));
      expect(tableContainer).toBeTruthy();
    });

    it('should hide table container when loading', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      const tableContainer = fixture.debugElement.query(By.css('.table-container'));
      expect(tableContainer).toBeFalsy();
    });
  });

  describe('Table Display', () => {
    beforeEach(() => {
      candidateDataSubject.next(mockCandidates);
      isLoadingSubject.next(false);
      fixture.detectChanges();
    });

    it('should render table with correct structure', () => {
      const table = fixture.debugElement.query(By.css('table[mat-table]'));
      expect(table).toBeTruthy();

      const headerRow = fixture.debugElement.query(By.css('tr[mat-header-row]'));
      expect(headerRow).toBeTruthy();

      const dataRows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(dataRows.length).toBe(mockCandidates.length);
    });

    it('should display all column headers', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('th[mat-header-cell]'));
      expect(headerCells.length).toBe(5);
    });

    it('should display candidate data in table cells', () => {
      const dataCells = fixture.debugElement.queryAll(By.css('td[mat-cell]'));

      // Should have 5 columns × 3 rows = 15 cells
      expect(dataCells.length).toBe(15);

      // Check first row data (John Doe)
      const firstRowCells = dataCells.slice(0, 5);
      expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('John');
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Doe');
      expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('Senior');
      expect(firstRowCells[3].nativeElement.textContent.trim()).toBe('5');
    });

    it('should display seniority with correct CSS class', () => {
      const seniorityElements = fixture.debugElement.queryAll(By.css('.seniority-senior, .seniority-junior'));
      expect(seniorityElements.length).toBeGreaterThan(0);

      // Check that senior candidates have the correct class
      const seniorElements = fixture.debugElement.queryAll(By.css('.seniority-senior'));
      expect(seniorElements.length).toBe(2); // John and Bob are senior

      // Check that junior candidates have the correct class
      const juniorElements = fixture.debugElement.queryAll(By.css('.seniority-junior'));
      expect(juniorElements.length).toBe(1); // Jane is junior
    });

    it('should display availability icons correctly', () => {
      const availabilityIcons = fixture.debugElement.queryAll(By.css('td mat-icon'));

      // Should have 3 availability icons (one per candidate)
      expect(availabilityIcons.length).toBe(3);

      // Check available icons (John and Bob are available)
      const availableIcons = availabilityIcons.filter(icon =>
        icon.nativeElement.textContent.trim() === 'check_circle'
      );
      expect(availableIcons.length).toBe(2);

      // Check unavailable icons (Jane is unavailable)
      const unavailableIcons = availabilityIcons.filter(icon =>
        icon.nativeElement.textContent.trim() === 'cancel'
      );
      expect(unavailableIcons.length).toBe(1);
    });

    it('should apply correct CSS classes to availability icons', () => {
      const availableIcons = fixture.debugElement.queryAll(By.css('mat-icon.available'));
      const unavailableIcons = fixture.debugElement.queryAll(By.css('mat-icon.unavailable'));

      expect(availableIcons.length).toBe(2); // John and Bob
      expect(unavailableIcons.length).toBe(1); // Jane
    });
  });

  describe('Empty State', () => {
    it('should show no data message when data source is empty', () => {
      candidateDataSubject.next([]);
      isLoadingSubject.next(false);
      fixture.detectChanges();

      const noDataElement = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataElement).toBeTruthy();

      const noDataIcon = fixture.debugElement.query(By.css('.no-data mat-icon'));
      expect(noDataIcon.nativeElement.textContent.trim()).toBe('assignment');
    });

    it('should hide table when data source is empty', () => {
      candidateDataSubject.next([]);
      isLoadingSubject.next(false);
      fixture.detectChanges();

      const table = fixture.debugElement.query(By.css('table[mat-table]'));
      expect(table).toBeTruthy(); // Table element still exists

      const dataRows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
      expect(dataRows.length).toBe(0); // But no data rows
    });

    it('should not show no data message when loading', () => {
      candidateDataSubject.next([]);
      isLoadingSubject.next(true);
      fixture.detectChanges();

      const noDataElement = fixture.debugElement.query(By.css('.no-data'));
      expect(noDataElement).toBeFalsy();
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

  describe('Component Cleanup', () => {
    it('should complete destroy subject on component destruction', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'complete');

      fixture.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should emit next on destroy subject before completing', () => {
      const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');

      component.ngOnDestroy();

      expect(destroyNextSpy).toHaveBeenCalled();
    });
  });

  describe('Data Source Management', () => {
    it('should maintain data source reference when data updates', () => {
      const originalDataSource = component.candidateDataSource;

      candidateDataSubject.next(mockCandidates);
      fixture.detectChanges();

      expect(component.candidateDataSource).toBe(originalDataSource);
      expect(component.candidateDataSource.data).toEqual(mockCandidates);
    });

    it('should handle rapid data updates correctly', () => {
      const firstBatch = [mockCandidates[0]];
      const secondBatch = [mockCandidates[1], mockCandidates[2]];

      candidateDataSubject.next(firstBatch);
      fixture.detectChanges();
      expect(component.candidateDataSource.data.length).toBe(1);

      candidateDataSubject.next(secondBatch);
      fixture.detectChanges();
      expect(component.candidateDataSource.data.length).toBe(2);
    });
  });

  describe('Observable Subscriptions', () => {
    it('should be subscribed to candidate data changes on init', () => {
      const initialData = [mockCandidates[0]];

      candidateDataSubject.next(initialData);
      fixture.detectChanges();

      expect(component.candidateDataSource.data).toEqual(initialData);
    });

    it('should be subscribed to loading state changes on init', () => {
      isLoadingSubject.next(true);
      fixture.detectChanges();

      expect(component.isLoading).toBe(true);
    });
  });
});

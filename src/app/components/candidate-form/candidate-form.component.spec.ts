import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ApiStatus, CandidateResponse, FileData } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { FileService } from '../../services/file.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { CandidateFormComponent } from './candidate-form.component';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let mockCandidateService: jest.Mocked<CandidateService>;
  let mockFileService: jest.Mocked<FileService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockApiStatusSubject: BehaviorSubject<ApiStatus>;

  const mockCandidatesData: CandidateResponse[] = [
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

  beforeEach(async () => {
    mockApiStatusSubject = new BehaviorSubject<ApiStatus>({
      online: true,
      lastCheck: new Date(),
      usingCachedData: false
    });

    mockCandidateService = {
      apiStatus$: mockApiStatusSubject.asObservable(),
      submitCandidate: jest.fn(),
      getAllCandidates: jest.fn(),
      getCachedDataInfo: jest.fn(),
      forceApiCheck: jest.fn()
    } as any;

    mockFileService = {
      parseCSVFile: jest.fn(),
      parseExcelFile: jest.fn()
    } as any;

    mockSnackBar = {
      open: jest.fn().mockReturnValue({ afterDismissed: () => of() })
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CandidateFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: FileService, useValue: mockFileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;


    mockCandidateService.getAllCandidates.mockReturnValue(of(mockCandidatesData));
    mockCandidateService.getCachedDataInfo.mockReturnValue({
      candidates: [],
      lastUpdated: null
    });
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should initialize form with required validators', () => {
      fixture.detectChanges();

      expect(component.candidateForm.get('name')?.hasError('required')).toBeTruthy();
      expect(component.candidateForm.get('surname')?.hasError('required')).toBeTruthy();
    });

    it('should load candidates on initialization', () => {
      fixture.detectChanges();
      expect(mockCandidateService.getAllCandidates).toHaveBeenCalled();
    });

    it('should update candidate data source when data changes', () => {
      fixture.detectChanges();


      expect(component.candidateDataSource.data.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const nameControl = component.candidateForm.get('name');
      const surnameControl = component.candidateForm.get('surname');

      expect(nameControl?.hasError('required')).toBeTruthy();
      expect(surnameControl?.hasError('required')).toBeTruthy();
    });

    it('should validate minimum length for fields', () => {
      const nameControl = component.candidateForm.get('name');
      const surnameControl = component.candidateForm.get('surname');

      nameControl?.setValue('A');
      surnameControl?.setValue('B');

      expect(nameControl?.hasError('minlength')).toBeTruthy();
      expect(surnameControl?.hasError('minlength')).toBeTruthy();
    });

    it('should accept valid form data', () => {
      component.candidateForm.patchValue({
        name: 'Juan',
        surname: 'Pérez'
      });

      expect(component.candidateForm.valid).toBeTruthy();
    });

    it('should enable submit only when form is valid and file is selected', () => {

      expect(component.canSubmit).toBeFalsy();


      component.candidateForm.patchValue({
        name: 'Juan',
        surname: 'Pérez'
      });
      expect(component.canSubmit).toBeFalsy();


      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      component.selectedFile = mockFile;
      expect(component.canSubmit).toBeTruthy();
    });
  });

  describe('File Upload Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle CSV file selection successfully', async () => {
      const mockFileData: FileData = {
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: true
      };

      mockFileService.parseCSVFile.mockReturnValue(of(mockFileData));

      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } };

      component.onFileSelected(event);

      expect(mockFileService.parseCSVFile).toHaveBeenCalledWith(file);
      expect(component.selectedFile).toBe(file);
    });

    it('should handle Excel file selection', () => {
      const mockFileData: FileData = {
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: false
      };

      mockFileService.parseExcelFile.mockReturnValue(of(mockFileData));

      const file = new File(['test data'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const event = { target: { files: [file] } };

      component.onFileSelected(event);

      expect(mockFileService.parseExcelFile).toHaveBeenCalledWith(file);
    });

    it('should reject unsupported file formats', () => {
      const file = new File(['test data'], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } };

      component.onFileSelected(event);

      expect(component.fileError).toBe('candidateForm.errors.fileInvalidFormat');
      expect(component.selectedFile).toBeNull();
    });

    it('should handle file parsing errors', () => {
      const errorMessage = 'Error al parsear el archivo';
      mockFileService.parseCSVFile.mockReturnValue(throwError(() => new Error(errorMessage)));

      const file = new File(['invalid,data'], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } };

      component.onFileSelected(event);

      expect(component.fileError).toBe('candidateForm.errors.fileReadError');
      expect(component.fileData).toBeNull();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();


      component.candidateForm.patchValue({
        name: 'Juan',
        surname: 'Pérez'
      });

      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      component.selectedFile = file;
    });

    it('should submit form with valid data', () => {
      const mockResponse: CandidateResponse = {
        id: '3',
        name: 'Juan',
        surname: 'Pérez',
        seniority: 'junior',
        yearsOfExperience: 3,
        availability: true
      };

      mockCandidateService.submitCandidate.mockReturnValue(of(mockResponse));

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).toHaveBeenCalled();
      const submitCall = mockCandidateService.submitCandidate.mock.calls[0];
      expect(submitCall[0]).toEqual({ name: 'Juan', surname: 'Pérez' });
      expect(submitCall[1]).toBeInstanceOf(File);
    });

    it('should handle submission errors gracefully', () => {
      mockCandidateService.submitCandidate.mockReturnValue(
        throwError(() => new Error('Server error'))
      );

      component.onSubmit();

      expect(component.isLoading).toBeFalsy();
    });

    it('should not submit without valid form', () => {
      component.candidateForm.patchValue({
        name: '',
        surname: ''
      });

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).not.toHaveBeenCalled();
    });

    it('should not submit without selected file', () => {
      component.selectedFile = null;

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).not.toHaveBeenCalled();
    });
  });

  describe('API Status Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display online status correctly', () => {
      const onlineStatus: ApiStatus = {
        online: true,
        lastCheck: new Date(),
        usingCachedData: false
      };

      mockApiStatusSubject.next(onlineStatus);


      expect(component.statusMessage).toBe('status.hasData');
      expect(component.statusCardClass).toBe('status-online');
    });

    it('should display offline status correctly', () => {
      const offlineStatus: ApiStatus = {
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      };

      mockApiStatusSubject.next(offlineStatus);

      expect(component.statusMessage).toBe('status.hasData');
      expect(component.statusCardClass).toBe('status-offline');
    });

    it('should handle API status changes', () => {

      expect(component.apiStatus.online).toBeTruthy();


      const offlineStatus: ApiStatus = {
        online: false,
        lastCheck: new Date(),
        usingCachedData: true
      };

      mockApiStatusSubject.next(offlineStatus);

      expect(component.apiStatus.online).toBeFalsy();
      expect(component.apiStatus.usingCachedData).toBeTruthy();
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should refresh data when requested', () => {
      component.refreshData();

      expect(mockCandidateService.getAllCandidates).toHaveBeenCalled();
      expect(mockCandidateService.forceApiCheck).toHaveBeenCalled();
    });

    it('should handle cached data when server is unavailable', () => {
      const cachedData = {
        candidates: mockCandidatesData,
        lastUpdated: new Date()
      };

      mockCandidateService.getCachedDataInfo.mockReturnValue(cachedData);
      mockCandidateService.getAllCandidates.mockReturnValue(
        throwError(() => new Error('Server unavailable'))
      );

      component.loadCandidates();


      expect(component.candidateDataSource.data.length).toBeGreaterThan(0);
    });

    it('should load fresh data when server is available', () => {
      const freshData: CandidateResponse[] = [...mockCandidatesData, {
        id: '3',
        name: 'Carlos',
        surname: 'López',
        seniority: 'senior',
        yearsOfExperience: 8,
        availability: true
      }];

      mockCandidateService.getAllCandidates.mockReturnValue(of(freshData));

      component.loadCandidates();

      expect(mockCandidateService.getAllCandidates).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      fixture.detectChanges();

      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should subscribe to API status changes on init', () => {

      const subscribeSpy = jest.spyOn(mockCandidateService.apiStatus$, 'subscribe');

      component.ngOnInit();

      expect(subscribeSpy).toHaveBeenCalled();
    });
  });

  describe('Form Getters', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should provide access to form controls through getters', () => {
      expect(component.name).toBe(component.candidateForm.get('name'));
      expect(component.surname).toBe(component.candidateForm.get('surname'));
    });

    it('should calculate canSubmit correctly based on form state and file', () => {

      expect(component.canSubmit).toBeFalsy();


      component.candidateForm.patchValue({
        name: 'Juan',
        surname: 'Pérez'
      });
      expect(component.canSubmit).toBeFalsy();


      component.selectedFile = new File(['test'], 'test.csv');
      expect(component.canSubmit).toBeTruthy();


      component.isLoading = true;
      expect(component.canSubmit).toBeFalsy();
    });
  });
});

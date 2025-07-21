import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoService } from '@jsverse/transloco';
import { of, throwError } from 'rxjs';
import { Candidate, CandidateResponse, FileData } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { FileParsingService } from '../../services/file-parsing.service';
import { NotificationService } from '../../services/notification.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { CandidateFormComponent } from './candidate-form.component';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let candidateService: jest.Mocked<CandidateService>;
  let fileParsingService: jest.Mocked<FileParsingService>;
  let notificationService: jest.Mocked<NotificationService>;
  let translocoService: TranslocoService;

  beforeEach(async () => {
    const candidateServiceMock = {
      apiStatus$: of({ online: true, lastCheck: new Date(), usingCachedData: false }),
      getCachedDataInfo: jest.fn().mockReturnValue({ candidates: [], lastUpdated: null }),
      getAllCandidates: jest.fn().mockReturnValue(of([])),
      submitCandidate: jest.fn(),
      forceApiCheck: jest.fn()
    };

    const fileParsingServiceMock = {
      parseFile: jest.fn()
    };

    const notificationServiceMock = {
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatTableModule,
        MatCardModule,
        MatExpansionModule,
        MatSnackBarModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: CandidateService, useValue: candidateServiceMock },
        { provide: FileParsingService, useValue: fileParsingServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    candidateService = TestBed.inject(CandidateService) as jest.Mocked<CandidateService>;
    fileParsingService = TestBed.inject(FileParsingService) as jest.Mocked<FileParsingService>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
    translocoService = TestBed.inject(TranslocoService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('File Upload Functionality', () => {
    it('should parse a valid file on selection', () => {
      const file = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const event = { target: { files: [file] } };
      const fileData: FileData = { seniority: 'junior', yearsOfExperience: 1, availability: true };
      fileParsingService.parseFile.mockReturnValue(of(fileData));

      component.onFileSelected(event);

      expect(fileParsingService.parseFile).toHaveBeenCalledWith(file);
      expect(component.fileData).toEqual(fileData);
      expect(component.fileError).toBeNull();
    });

    it('should handle file parsing errors', () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } };
      const error = new Error('File read error');
      fileParsingService.parseFile.mockReturnValue(throwError(() => error));

      component.onFileSelected(event);

      expect(component.fileError).toBe('File read error');
      expect(component.fileData).toBeNull();
    });
  });

  describe('Form Submission', () => {
    it('should submit candidate data when form is valid', () => {
      component.candidateForm.setValue({ name: 'John', surname: 'Doe' });
      component.selectedFile = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const candidate: Candidate = { name: 'John', surname: 'Doe' };
      candidateService.submitCandidate.mockReturnValue(of({} as CandidateResponse));

      component.onSubmit();

      const submittedFile = candidateService.submitCandidate.mock.calls[0][1];
      expect(submittedFile.name).toBe('test.xlsx');
      expect(submittedFile.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Candidato registrado exitosamente');
    });

    it('should show error if form is invalid on submit', () => {
      component.onSubmit();
      expect(notificationService.showError).toHaveBeenCalledWith('candidateForm.errors.fileRequired');
    });
  });

  describe('Data Loading and Caching', () => {
    it('should load candidates on init', () => {
      expect(candidateService.getAllCandidates).toHaveBeenCalled();
    });

    it('should show warning if using cached data', () => {
      const cachedData = { candidates: [{ id: '1', name: 'test', surname: 'test', seniority: 'junior', yearsOfExperience: 1, availability: true }], lastUpdated: new Date() };
      candidateService.getCachedDataInfo.mockReturnValue(cachedData as { candidates: CandidateResponse[]; lastUpdated: Date | null });
      component.loadCandidates();
      expect(notificationService.showWarning).toHaveBeenCalled();
    });
  });

  describe('UI Status', () => {
    it('should return correct status card class', () => {
      component.apiStatus.online = true;
      expect(component.statusCardClass).toBe('status-online');
      component.apiStatus.online = false;
      expect(component.statusCardClass).toBe('status-offline');
    });

    it('should return correct status message', () => {
      component.candidateDataSource.data = [];
      expect(component.statusMessage).toBe('status.noData');
      component.candidateDataSource.data = [{} as CandidateResponse];
      expect(component.statusMessage).toBe('status.hasData');
    });
  });
});

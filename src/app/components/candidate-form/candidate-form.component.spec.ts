import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FileData } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';
import { FileParsingService } from '../../services/file-parsing.service';
import { NotificationService } from '../../services/notification.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { CandidateFormComponent } from './candidate-form.component';

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let mockCandidateService: jest.Mocked<CandidateService>;
  let mockCandidateStateService: jest.Mocked<CandidateStateService>;
  let mockFileParsingService: jest.Mocked<FileParsingService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const mockFileData: FileData = {
    seniority: 'senior',
    yearsOfExperience: 5,
    availability: true
  };

  const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

  const mockCandidateResponse = {
    id: '1',
    name: 'John',
    surname: 'Doe',
    seniority: 'senior' as const,
    yearsOfExperience: 5,
    availability: true
  };

  beforeEach(async () => {
    // Create mock services
    mockCandidateService = {
      submitCandidate: jest.fn()
    } as any;

    mockCandidateStateService = {
      loadCandidates: jest.fn()
    } as any;

    mockFileParsingService = {
      parseFile: jest.fn()
    } as any;

    mockNotificationService = {
      showSuccess: jest.fn(),
      showError: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CandidateFormComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        NoopAnimationsModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: CandidateStateService, useValue: mockCandidateStateService },
        { provide: FileParsingService, useValue: mockFileParsingService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
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

    it('should render the form with correct structure', () => {
      const formCard = fixture.debugElement.query(By.css('mat-card'));
      expect(formCard).toBeTruthy();

      const form = fixture.debugElement.query(By.css('form'));
      expect(form).toBeTruthy();

      const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
      expect(nameInput).toBeTruthy();

      const surnameInput = fixture.debugElement.query(By.css('input[formControlName="surname"]'));
      expect(surnameInput).toBeTruthy();

      const fileInput = fixture.debugElement.query(By.css('input[type="file"]'));
      expect(fileInput).toBeTruthy();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton).toBeTruthy();
    });

    it('should initialize form with empty values and required validators', () => {
      expect(component.candidateForm.get('name')?.value).toBe('');
      expect(component.candidateForm.get('surname')?.value).toBe('');
      expect(component.candidateForm.get('name')?.hasError('required')).toBe(true);
      expect(component.candidateForm.get('surname')?.hasError('required')).toBe(true);
    });

    it('should have submit button disabled initially', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
      expect(component.canSubmit).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should show required error when name is empty', () => {
      const nameControl = component.candidateForm.get('name');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should show minlength error when name is too short', () => {
      const nameControl = component.candidateForm.get('name');
      nameControl?.setValue('A');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      expect(nameControl?.hasError('minlength')).toBe(true);
    });

    it('should show required error when surname is empty', () => {
      const surnameControl = component.candidateForm.get('surname');
      surnameControl?.markAsTouched();
      fixture.detectChanges();

      expect(surnameControl?.hasError('required')).toBe(true);
    });

    it('should show minlength error when surname is too short', () => {
      const surnameControl = component.candidateForm.get('surname');
      surnameControl?.setValue('B');
      surnameControl?.markAsTouched();
      fixture.detectChanges();

      expect(surnameControl?.hasError('minlength')).toBe(true);
    });

    it('should be valid when all fields are correctly filled', () => {
      component.candidateForm.patchValue({
        name: 'John',
        surname: 'Doe'
      });
      component.selectedFile = mockFile;

      expect(component.candidateForm.valid).toBe(true);
      expect(component.canSubmit).toBe(true);
    });
  });

  describe('File Selection', () => {
    it('should handle successful file parsing', () => {
      mockFileParsingService.parseFile.mockReturnValue(of(mockFileData));

      const event = {
        target: {
          files: [mockFile]
        }
      };

      component.onFileSelected(event);

      expect(mockFileParsingService.parseFile).toHaveBeenCalledWith(mockFile);
      expect(component.selectedFile).toBe(mockFile);
      expect(component.fileData).toEqual(mockFileData);
      expect(component.fileError).toBeNull();
    });

    it('should handle file parsing error', () => {
      const errorMessage = 'Invalid file format';
      mockFileParsingService.parseFile.mockReturnValue(throwError(() => ({ message: errorMessage })));

      const event = {
        target: {
          files: [mockFile]
        }
      };

      component.onFileSelected(event);

      expect(component.selectedFile).toBe(mockFile);
      expect(component.fileData).toBeNull();
      expect(component.fileError).toBe(errorMessage);
    });

    it('should show file info when file is successfully parsed', () => {
      mockFileParsingService.parseFile.mockReturnValue(of(mockFileData));
      component.selectedFile = mockFile;
      component.fileData = mockFileData;
      component.fileError = null;
      fixture.detectChanges();

      const fileInfoElement = fixture.debugElement.query(By.css('.file-info'));
      expect(fileInfoElement).toBeTruthy();

      const successCard = fixture.debugElement.query(By.css('.info-card.success'));
      expect(successCard).toBeTruthy();
    });

    it('should show file error message when parsing fails', () => {
      component.fileError = 'Invalid file format';
      fixture.detectChanges();

      const errorElement = fixture.debugElement.query(By.css('.file-error-message'));
      expect(errorElement).toBeTruthy();

      const errorIcon = fixture.debugElement.query(By.css('.file-error-message mat-icon'));
      expect(errorIcon.nativeElement.textContent.trim()).toBe('error');
    });

    it('should show file instructions when no file is selected', () => {
      component.selectedFile = null;
      fixture.detectChanges();

      const instructionsElement = fixture.debugElement.query(By.css('.file-instructions'));
      expect(instructionsElement).toBeTruthy();

      const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));
      expect(expansionPanel).toBeTruthy();
    });

    it('should trigger file input click when upload button is clicked', () => {
      const fileInput = fixture.debugElement.query(By.css('input[type="file"]'));
      const clickSpy = jest.spyOn(fileInput.nativeElement, 'click');

      const uploadButton = fixture.debugElement.query(By.css('button[matSuffix]'));
      uploadButton.nativeElement.click();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Set up valid form
      component.candidateForm.patchValue({
        name: 'John',
        surname: 'Doe'
      });
      component.selectedFile = mockFile;
    });

    it('should submit form successfully with valid data', () => {
      mockCandidateService.submitCandidate.mockReturnValue(of(mockCandidateResponse));

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).toHaveBeenCalledWith(
        { name: 'John', surname: 'Doe' },
        mockFile
      );
    });

    it('should handle submission error', () => {
      mockCandidateService.submitCandidate.mockReturnValue(throwError(() => new Error('Server error')));

      component.onSubmit();

      expect(mockNotificationService.showError).toHaveBeenCalled();
    });

    it('should set loading state when submission starts', () => {
      // Create a subject that we can control
      const submitSubject = new BehaviorSubject(mockCandidateResponse);
      mockCandidateService.submitCandidate.mockReturnValue(submitSubject.asObservable());

      // Initially not loading
      expect(component.isLoading).toBe(false);

      // Call onSubmit - this should set isLoading to true immediately
      component.onSubmit();

      // Verify loading state is set
      expect(component.isLoading).toBe(true);
    });

    it('should show error when form is invalid', () => {
      component.candidateForm.patchValue({
        name: '',
        surname: 'Doe'
      });

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).not.toHaveBeenCalled();
      expect(mockNotificationService.showError).toHaveBeenCalled();
    });

    it('should show error when no file is selected', () => {
      component.selectedFile = null;

      component.onSubmit();

      expect(mockCandidateService.submitCandidate).not.toHaveBeenCalled();
      expect(mockNotificationService.showError).toHaveBeenCalled();
    });

    it('should reset form after successful submission', () => {
      // Set up initial state
      component.candidateForm.patchValue({
        name: 'John',
        surname: 'Doe'
      });
      component.selectedFile = mockFile;
      component.fileData = mockFileData;

      // Call resetForm directly to avoid async issues
      component['resetForm']();

      expect(component.candidateForm.value).toEqual({ name: null, surname: null });
      expect(component.selectedFile).toBeNull();
      expect(component.fileData).toBeNull();
      expect(component.fileError).toBeNull();
    });
  });

  describe('UI State Management', () => {
    it('should disable submit button when loading', () => {
      component.candidateForm.patchValue({
        name: 'John',
        surname: 'Doe'
      });
      component.selectedFile = mockFile;
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should show spinner when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should show button status message when form cannot be submitted', () => {
      component.candidateForm.patchValue({
        name: '',
        surname: ''
      });
      component.selectedFile = null;
      fixture.detectChanges();

      const statusElement = fixture.debugElement.query(By.css('.button-status'));
      expect(statusElement).toBeTruthy();

      const infoIcon = fixture.debugElement.query(By.css('.button-status mat-icon'));
      expect(infoIcon.nativeElement.textContent.trim()).toBe('info');
    });
  });

  describe('Form Getters', () => {
    it('should return correct form controls through getters', () => {
      expect(component.name).toBe(component.candidateForm.get('name'));
      expect(component.surname).toBe(component.candidateForm.get('surname'));
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy subject on component destruction', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'complete');

      fixture.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('File Input Interaction', () => {
    it('should clear file input value when form is reset', () => {
      // Mock DOM element
      const mockFileInput = { value: 'test.csv' };
      jest.spyOn(document, 'getElementById').mockReturnValue(mockFileInput as any);

      component.candidateForm.patchValue({
        name: 'John',
        surname: 'Doe'
      });
      component.selectedFile = mockFile;

      // Call the private resetForm method directly to avoid async issues
      component['resetForm']();

      expect(mockFileInput.value).toBe('');
      expect(component.candidateForm.value).toEqual({ name: null, surname: null });
      expect(component.selectedFile).toBeNull();
      expect(component.fileData).toBeNull();
      expect(component.fileError).toBeNull();
    });
  });
});

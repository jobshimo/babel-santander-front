import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ApiStatus, Candidate, CandidateResponse, FileData } from '../../models/candidate.model';
import { CandidateService } from '../../services/candidate.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    TranslocoModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent implements OnInit, OnDestroy {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  fileData: FileData | null = null;
  isLoading = false;
  isLoadingCandidates = false;
  fileError: string | null = null;

  private candidateDataSubject = new BehaviorSubject<CandidateResponse[]>([]);
  public candidateData$ = this.candidateDataSubject.asObservable();

  public apiStatus: ApiStatus = { online: true, lastCheck: new Date(), usingCachedData: false };

  public candidateDataSource = new MatTableDataSource<CandidateResponse>([]);

  displayedColumns: string[] = ['name', 'surname', 'seniority', 'yearsOfExperience', 'availability'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private translocoService: TranslocoService
  ) {
    this.candidateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.candidateService.apiStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.apiStatus = status;
      if (status.online && !status.usingCachedData) {
        const hasData = this.candidateDataSubject.value.length > 0;
        if (hasData) {
          this.showSuccess('✅ Servidor reconectado - Datos actualizados');
        }
      }
    });

    this.candidateData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.candidateDataSource.data = data;
    });

    this.loadCandidates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCandidates(): void {
    const cachedInfo = this.candidateService.getCachedDataInfo();
    const hasCachedData = cachedInfo.candidates.length > 0;

    if (hasCachedData) {
      this.candidateDataSubject.next(cachedInfo.candidates);
      const lastUpdate = cachedInfo.lastUpdated
        ? new Date(cachedInfo.lastUpdated).toLocaleString()
        : 'desconocida';
      this.showWarning(`📂 Datos de respaldo (última actualización: ${lastUpdate})`);
    } else {
      this.isLoadingCandidates = true;
    }

    this.candidateService.getAllCandidates().pipe(
      tap(freshCandidates => {
        this.candidateDataSubject.next(freshCandidates);
      }),
      catchError(error => {
        console.error('Servidor no disponible:', error);
        if (!hasCachedData) {
          this.showError('❌ No hay datos disponibles y el servidor no responde');
        }
        return [];
      }),
      finalize(() => {
        this.isLoadingCandidates = false;
      })
    ).subscribe();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = null;
      this.fileData = null;
      this.parseFile(file);
    }
  }

  private parseFile(file: File): void {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    let parseObservable: Observable<FileData>;

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseObservable = this.fileService.parseExcelFile(file);
    } else if (fileExtension === 'csv') {
      parseObservable = this.fileService.parseCSVFile(file);
    } else {
      this.selectedFile = null;
      this.fileError = 'candidateForm.errors.fileInvalidFormat';
      this.showError(this.translocoService.translate('candidateForm.errors.fileInvalidFormat'));
      return;
    }

    parseObservable.pipe(
      tap(data => {
        this.fileData = data;
        this.fileError = null;
        this.showSuccess(this.translocoService.translate('success.candidateRegistered'));
      }),
      catchError(error => {
        const translatedErrorKey = this.getTranslatedError(error.message);
        this.fileError = translatedErrorKey;
        this.fileData = null;
        this.showError(this.translocoService.translate(translatedErrorKey));
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSubmit(): void {
    if (this.candidateForm.valid && this.selectedFile) {
      this.isLoading = true;

      const candidateData: Candidate = {
        name: this.candidateForm.value.name,
        surname: this.candidateForm.value.surname
      };

      this.candidateService.submitCandidate(candidateData, this.selectedFile).pipe(
        tap(response => {
          this.showSuccess(this.translocoService.translate('success.candidateRegistered'));
          this.resetForm();
          this.loadCandidates();
        }),
        catchError(error => {
          this.showError(this.translocoService.translate('status.error'));
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    } else {
      this.showError(this.translocoService.translate('candidateForm.errors.fileRequired'));
    }
  }

  refreshData(): void {
    this.loadCandidates();
    this.candidateService.forceApiCheck();
  }

  private resetForm(): void {
    this.candidateForm.reset();
    this.selectedFile = null;
    this.fileData = null;
    this.fileError = null;

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showWarning(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['warning-snackbar']
    });
  }

  private getTranslatedError(errorMessage: string): string {
    if (errorMessage.includes('vacío')) return 'candidateForm.errors.fileEmpty';
    if (errorMessage.includes('columnas')) return 'candidateForm.errors.fileInvalidColumns';
    if (errorMessage.includes('seniority')) return 'candidateForm.errors.fileInvalidSeniority';
    if (errorMessage.includes('yearsOfExperience')) return 'candidateForm.errors.fileInvalidExperience';
    if (errorMessage.includes('availability')) return 'candidateForm.errors.fileInvalidAvailability';
    if (errorMessage.includes('leer')) return 'candidateForm.errors.fileReadError';
    if (errorMessage.includes('fila')) return 'candidateForm.errors.fileInvalidRows';
    if (errorMessage.includes('coincide')) return 'candidateForm.errors.fileColumnMismatch';
    return 'candidateForm.errors.fileReadError';
  }

  get name() { return this.candidateForm.get('name'); }
  get surname() { return this.candidateForm.get('surname'); }

  get canSubmit(): boolean {
    return this.candidateForm.valid && this.selectedFile !== null && !this.isLoading;
  }

  get statusCardClass(): string {
    return this.apiStatus.online ? 'status-online' : 'status-offline';
  }

  get statusMessage(): string {
    const candidates = this.candidateDataSource.data;
    if (candidates.length === 0) {
      return 'status.noData';
    } else {
      return 'status.hasData';
    }
  }

  get candidateCount(): number {
    return this.candidateDataSource.data.length;
  }
}

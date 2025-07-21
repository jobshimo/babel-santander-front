import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { Candidate, FileData } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';
import { FileParsingService } from '../../services/file-parsing.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    TranslocoModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent implements OnDestroy {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  fileData: FileData | null = null;
  isLoading = false;
  fileError: string | null = null;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private candidateService = inject(CandidateService);
  private candidateStateService = inject(CandidateStateService);
  private translocoService = inject(TranslocoService);
  private fileParsingService = inject(FileParsingService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.candidateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileError = null;
      this.fileData = null;

      this.fileParsingService.parseFile(file).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: data => {
          this.fileData = data;
          this.fileError = null;
        },
        error: err => {
          this.fileError = err.message;
          this.fileData = null;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.candidateForm.valid && this.selectedFile) {
      this.isLoading = true;

      const candidateData: Candidate = {
        name: this.candidateForm.value.name,
        surname: this.candidateForm.value.surname
      };

      this.candidateService.submitCandidate(candidateData, this.selectedFile).pipe(
        tap(() => {
          this.notificationService.showSuccess(this.translocoService.translate('success.candidateRegistered'));
          this.resetForm();
          this.candidateStateService.loadCandidates();
        }),
        catchError(() => {
          this.notificationService.showError(this.translocoService.translate('status.error'));
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    } else {
      this.notificationService.showError(this.translocoService.translate('candidateForm.errors.fileRequired'));
    }
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

  get name() { return this.candidateForm.get('name'); }
  get surname() { return this.candidateForm.get('surname'); }

  get canSubmit(): boolean {
    return this.candidateForm.valid && this.selectedFile !== null && !this.isLoading;
  }
}

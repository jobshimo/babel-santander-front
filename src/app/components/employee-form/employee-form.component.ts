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
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { ApiStatus, Employee, EmployeeResponse, FileData } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-employee-form',
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
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  employeeForm: FormGroup;
  selectedFile: File | null = null;
  fileData: FileData | null = null;
  isLoading = false;
  isLoadingCandidates = false;
  fileError: string | null = null;

  private employeeDataSubject = new BehaviorSubject<EmployeeResponse[]>([]);
  public employeeData$ = this.employeeDataSubject.asObservable();

  public apiStatus: ApiStatus = { online: true, lastCheck: new Date(), usingCachedData: false };

  public employeeDataSource = new MatTableDataSource<EmployeeResponse>([]);

  displayedColumns: string[] = ['name', 'surname', 'seniority', 'yearsOfExperience', 'availability'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private fileService: FileService,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.employeeService.apiStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.apiStatus = status;
      if (status.online && !status.usingCachedData) {
        const hasData = this.employeeDataSubject.value.length > 0;
        if (hasData) {
          this.showSuccess('✅ Servidor reconectado - Datos actualizados');
        }
      }
    });

    this.employeeData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.employeeDataSource.data = data;
    });

    this.loadCandidates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCandidates(): void {
    const cachedInfo = this.employeeService.getCachedDataInfo();
    const hasCachedData = cachedInfo.candidates.length > 0;

    if (hasCachedData) {
      this.employeeDataSubject.next(cachedInfo.candidates);
      const lastUpdate = cachedInfo.lastUpdated
        ? new Date(cachedInfo.lastUpdated).toLocaleString()
        : 'desconocida';
      this.showWarning(`📂 Datos de respaldo (última actualización: ${lastUpdate})`);
    } else {
      this.isLoadingCandidates = true;
    }

    this.employeeService.getAllCandidates().pipe(
      tap(freshCandidates => {
        this.employeeDataSubject.next(freshCandidates);
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
      this.fileError = 'Formato de archivo no soportado. Use .xlsx, .xls o .csv';
      this.showError('Formato de archivo no soportado. Use .xlsx, .xls o .csv');
      return;
    }

    parseObservable.pipe(
      tap(data => {
        this.fileData = data;
        this.fileError = null;
        this.showSuccess('Archivo procesado correctamente');
      }),
      catchError(error => {
        this.fileError = error.message;
        this.fileData = null;
        this.showError(error.message);
        return [];
      })
    ).subscribe();
  }

  onSubmit(): void {
    if (this.employeeForm.valid && this.selectedFile) {
      this.isLoading = true;

      const employeeData: Employee = {
        name: this.employeeForm.value.name,
        surname: this.employeeForm.value.surname
      };

      this.employeeService.submitEmployee(employeeData, this.selectedFile).pipe(
        tap(response => {
          this.showSuccess('Candidato registrado correctamente');
          this.resetForm();
          this.loadCandidates();
        }),
        catchError(error => {
          this.showError('Error al registrar candidato. El servidor no está disponible.');
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
        })
      ).subscribe();
    } else {
      this.showError('Por favor, complete todos los campos requeridos y seleccione un archivo');
    }
  }

  refreshData(): void {
    this.loadCandidates();
    this.employeeService.forceApiCheck();
  }

  private resetForm(): void {
    this.employeeForm.reset();
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

  get name() { return this.employeeForm.get('name'); }
  get surname() { return this.employeeForm.get('surname'); }

  get canSubmit(): boolean {
    return this.employeeForm.valid && this.selectedFile !== null && !this.isLoading;
  }

  get statusCardClass(): string {
    return this.apiStatus.online ? 'status-online' : 'status-offline';
  }

  get statusMessage(): string {
    if (this.apiStatus.online) {
      return '🟢 Servidor disponible - Datos actualizados';
    } else {
      return '🔴 Servidor no disponible - Mostrando datos de respaldo';
    }
  }
}

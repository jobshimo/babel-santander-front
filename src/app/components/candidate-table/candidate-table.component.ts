import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CandidateResponse } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';

@Component({
  selector: 'app-candidate-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TranslocoModule
  ],
  templateUrl: './candidate-table.component.html',
  styleUrls: ['./candidate-table.component.scss']
})
export class CandidateTableComponent implements OnInit, OnDestroy {
  candidateDataSource = new MatTableDataSource<CandidateResponse>([]);
  displayedColumns: string[] = ['name', 'surname', 'seniority', 'yearsOfExperience', 'availability'];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private candidateStateService: CandidateStateService) {}

  ngOnInit(): void {
    // Escuchar cambios en los datos
    this.candidateStateService.candidateData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.candidateDataSource.data = data;
    });

    // Escuchar estado de carga
    this.candidateStateService.isLoading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    this.candidateStateService.refreshData();
  }
}

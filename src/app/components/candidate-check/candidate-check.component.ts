import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiStatus } from '../../models/candidate.model';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';

@Component({
  selector: 'app-candidate-check',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    TranslocoModule,
    MatIconModule,
  ],
  templateUrl: './candidate-check.component.html',
  styleUrls: ['./candidate-check.component.scss']
})
export class CandidateCheckComponent implements OnInit, OnDestroy {
  isLoading = false;
  apiStatus: ApiStatus = { online: true, lastCheck: new Date(), usingCachedData: false };
  candidateCount = 0;

  private destroy$ = new Subject<void>();
  private candidateService = inject(CandidateService);
  private candidateStateService = inject(CandidateStateService);

  ngOnInit(): void {
    // Escuchar cambios en el estado de la API
    this.candidateService.apiStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.apiStatus = status;
    });

    // Escuchar cambios en los datos para actualizar el contador
    this.candidateStateService.candidateData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.candidateCount = data.length;
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

  get statusCardClass(): string {
    return (this.apiStatus.online && !this.apiStatus.usingCachedData) ? 'status-online' : 'status-offline';
  }

  get statusMessage(): string {
    const hasData = this.candidateCount > 0;
    const isOnline = this.apiStatus.online;
    const usingCachedData = this.apiStatus.usingCachedData;

    if (!hasData && (!isOnline || usingCachedData)) {
      return 'status.noDataOffline';
    } else if (!hasData) {
      return 'status.noData';
    } else if (!isOnline || usingCachedData) {
      return 'status.hasDataOffline';
    } else {
      return 'status.hasData';
    }
  }
}

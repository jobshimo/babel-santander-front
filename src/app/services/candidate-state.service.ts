import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { CandidateResponse } from '../models/candidate.model';
import { CandidateService } from './candidate.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CandidateStateService {
  private candidateDataSubject = new BehaviorSubject<CandidateResponse[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private refreshTriggerSubject = new Subject<void>();

  public candidateData$ = this.candidateDataSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public refreshTrigger$ = this.refreshTriggerSubject.asObservable();

  constructor(
    private candidateService: CandidateService,
    private notificationService: NotificationService
  ) {}

  get currentCandidates(): CandidateResponse[] {
    return this.candidateDataSubject.value;
  }

  get candidateCount(): number {
    return this.candidateDataSubject.value.length;
  }

  loadCandidates(): void {
    const cachedInfo = this.candidateService.getCachedDataInfo();
    const hasCachedData = cachedInfo.candidates.length > 0;

    if (hasCachedData) {
      this.candidateDataSubject.next(cachedInfo.candidates);
      const lastUpdate = cachedInfo.lastUpdated
        ? new Date(cachedInfo.lastUpdated).toLocaleString()
        : 'desconocida';
      this.notificationService.showWarning(`📂 Datos de respaldo (última actualización: ${lastUpdate})`);
    } else {
      this.isLoadingSubject.next(true);
    }

    this.candidateService.getAllCandidates().pipe(
      tap(freshCandidates => {
        this.candidateDataSubject.next(freshCandidates);
      }),
      catchError(error => {
        console.error('Servidor no disponible:', error);
        if (!hasCachedData) {
          this.notificationService.showError('❌ No hay datos disponibles y el servidor no responde');
        }
        return [];
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    ).subscribe();
  }

  refreshData(): void {
    this.candidateService.forceApiCheck();
    this.loadCandidates();
    this.refreshTriggerSubject.next();
  }

  addCandidate(candidate: CandidateResponse): void {
    const currentCandidates = this.candidateDataSubject.value;
    this.candidateDataSubject.next([...currentCandidates, candidate]);
  }
}

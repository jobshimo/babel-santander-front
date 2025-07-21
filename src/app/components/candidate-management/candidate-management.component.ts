import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CandidateStateService } from '../../services/candidate-state.service';
import { CandidateService } from '../../services/candidate.service';
import { NotificationService } from '../../services/notification.service';
import { CandidateCheckComponent } from '../candidate-check/candidate-check.component';
import { CandidateFormComponent } from '../candidate-form/candidate-form.component';
import { CandidateTableComponent } from '../candidate-table/candidate-table.component';

@Component({
  selector: 'app-candidate-management',
  standalone: true,
  imports: [
    CommonModule,
    CandidateCheckComponent,
    CandidateFormComponent,
    CandidateTableComponent
  ],
  template: `
    <div class="candidate-management-container">
      <app-candidate-check></app-candidate-check>
      <app-candidate-form></app-candidate-form>
      <app-candidate-table></app-candidate-table>
    </div>
  `,
  styleUrls: ['./candidate-management.component.scss']
})
export class CandidateManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private candidateStateService: CandidateStateService,
    private candidateService: CandidateService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en el estado de la API
    this.candidateService.apiStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      if (status.online && !status.usingCachedData) {
        const hasData = this.candidateStateService.currentCandidates.length > 0;
        if (hasData) {
          this.notificationService.showSuccess('✅ Servidor reconectado - Datos actualizados');
        }
      }
    });

    // Cargar datos iniciales
    this.candidateStateService.loadCandidates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

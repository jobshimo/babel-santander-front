import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
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
  private candidateStateService = inject(CandidateStateService);
  private candidateService = inject(CandidateService);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  ngOnInit(): void {
    this.candidateService.apiStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      if (status.online && !status.usingCachedData) {
        const hasData = this.candidateStateService.currentCandidates.length > 0;
        if (hasData) {
          const message = this.translocoService.translate('status.serverReconnected');
          this.notificationService.showSuccess(message);
        }
      }
    });

    this.candidateStateService.loadCandidates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

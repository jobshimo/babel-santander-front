import { Routes } from '@angular/router';
import { CandidateManagementComponent } from './components/candidate-management/candidate-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/candidates', pathMatch: 'full' },
  { path: 'candidates', component: CandidateManagementComponent },
  { path: '**', redirectTo: '/candidates' }
];

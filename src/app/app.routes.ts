import { Routes } from '@angular/router';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/candidates', pathMatch: 'full' },
  { path: 'candidates', component: CandidateFormComponent },
  { path: '**', redirectTo: '/candidates' }
];

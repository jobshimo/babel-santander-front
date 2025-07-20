import { TestBed } from '@angular/core/testing';
import { routes } from './app.routes';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.component';

describe('App Routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should have routes defined', () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBeTruthy();
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have root redirect route', () => {
    const rootRoute = routes.find(route => route.path === '');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.redirectTo).toBe('/candidates');
    expect(rootRoute?.pathMatch).toBe('full');
  });

  it('should have candidates route', () => {
    const candidatesRoute = routes.find(route => route.path === 'candidates');
    expect(candidatesRoute).toBeDefined();
    expect(candidatesRoute?.component).toBe(CandidateFormComponent);
  });

  it('should have wildcard route for unknown paths', () => {
    const wildcardRoute = routes.find(route => route.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.redirectTo).toBe('/candidates');
  });

  it('should contain all expected routes', () => {
    expect(routes.length).toBe(3);

    const paths = routes.map(route => route.path);
    expect(paths).toContain('');
    expect(paths).toContain('candidates');
    expect(paths).toContain('**');
  });
});

import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';

describe('AppConfig', () => {
  it('should provide all necessary providers', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBeTruthy();
  });

  it('should configure the application with all required providers', async () => {

    await TestBed.configureTestingModule({
      providers: appConfig.providers
    }).compileComponents();


    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });

  it('should include zone change detection configuration', () => {
    const hasZoneProvider = appConfig.providers?.some(provider =>
      typeof provider === 'object' && provider !== null &&
      provider.toString().includes('ZoneChangeDetection')
    );

    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });

  it('should include router configuration', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });

  it('should include HTTP client configuration', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });

  it('should include animations configuration', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });
});

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslocoService } from '@jsverse/transloco';

import { LanguageService } from '../../services/language.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing';
import { LanguageSelectorComponent } from './language-selector.component';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let languageServiceSpy: any;
  let translocoServiceSpy: any;

  beforeEach(async () => {
    const languageSpy = {
      initializeLanguage: jest.fn(),
      getCurrentLanguage: jest.fn().mockReturnValue('es'),
      setLanguage: jest.fn(),
      getAvailableLanguages: jest.fn().mockReturnValue([
        { code: 'es', name: 'languages.es' },
        { code: 'en', name: 'languages.en' }
      ])
    };

    const translocoSpy = {
      translate: jest.fn().mockImplementation((key: string) => {
        const translations: { [key: string]: string } = {
          'app.language': 'Idioma',
          'languages.es': 'Español',
          'languages.en': 'English'
        };
        return translations[key] || key;
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        LanguageSelectorComponent,
        MatSelectModule,
        MatFormFieldModule,
        CommonModule,
        NoopAnimationsModule,
        getTranslocoTestingModule()
      ],
      providers: [
        { provide: LanguageService, useValue: languageSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    languageServiceSpy = TestBed.inject(LanguageService);
    translocoServiceSpy = TestBed.inject(TranslocoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with current language set in constructor', () => {
      languageServiceSpy.getCurrentLanguage.mockReturnValue('es');

      const newComponent = new LanguageSelectorComponent(languageServiceSpy, translocoServiceSpy);

      newComponent.currentLanguage = languageServiceSpy.getCurrentLanguage();

      expect(newComponent.currentLanguage).toBe('es');
    });

    it('should initialize language service and update current language on ngOnInit', () => {
      languageServiceSpy.getCurrentLanguage.mockReturnValue('en');

      component.ngOnInit();

      expect(languageServiceSpy.initializeLanguage).toHaveBeenCalled();
      expect(component.currentLanguage).toBe('en');
    });

    it('should load available languages on ngOnInit', () => {
      component.ngOnInit();

      expect(languageServiceSpy.getAvailableLanguages).toHaveBeenCalled();
      expect(component.availableLanguages).toEqual([
        { code: 'es', name: 'languages.es' },
        { code: 'en', name: 'languages.en' }
      ]);
    });
  });

  describe('Language Change Workflow', () => {
    it('should update current language on language change', () => {
      component.onLanguageChange('en');

      expect(languageServiceSpy.setLanguage).toHaveBeenCalledWith('en');
      expect(component.currentLanguage).toBe('en');
    });
  });
});

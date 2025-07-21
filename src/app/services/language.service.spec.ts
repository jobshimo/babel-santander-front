import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { getTranslocoTestingModule } from '../testing/transloco-testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let translocoServiceSpy: any;

  beforeEach(() => {
    const spy = {
      setActiveLang: jest.fn(),
      getActiveLang: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [
        LanguageService,
        { provide: TranslocoService, useValue: spy }
      ]
    });

    service = TestBed.inject(LanguageService);
    translocoServiceSpy = TestBed.inject(TranslocoService);

    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setLanguage', () => {
    it('should set active language via TranslocoService', () => {
      const language = 'en';

      service.setLanguage(language);

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith(language);
    });

    it('should save selected language to localStorage', () => {
      const language = 'es';

      service.setLanguage(language);

      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', language);
    });

    it('should handle different language codes', () => {
      service.setLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en');

      service.setLanguage('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'es');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current active language from TranslocoService', () => {
      const expectedLanguage = 'en';
      translocoServiceSpy.getActiveLang.mockReturnValue(expectedLanguage);

      const result = service.getCurrentLanguage();

      expect(result).toBe(expectedLanguage);
      expect(translocoServiceSpy.getActiveLang).toHaveBeenCalled();
    });
  });

  describe('initializeLanguage', () => {
    it('should set language from localStorage when valid language is saved', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('en');

      service.initializeLanguage();

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('en');
    });

    it('should set language for Spanish when saved in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('es');

      service.initializeLanguage();

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    });

    it('should set default language (es) when no language is saved in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      service.initializeLanguage();

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    });

    it('should set default language (es) when invalid language is saved in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('fr');

      service.initializeLanguage();

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    });

    it('should set default language (es) for empty string in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('');

      service.initializeLanguage();

      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    });

    it('should handle null values in localStorage gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(() => service.initializeLanguage()).not.toThrow();
      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('es');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array of available language options', () => {
      const result = service.getAvailableLanguages();

      expect(result).toEqual([
        { code: 'es', name: 'languages.es' },
        { code: 'en', name: 'languages.en' }
      ]);
    });

    it('should return consistent structure for language options', () => {
      const result = service.getAvailableLanguages();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);

      result.forEach(lang => {
        expect(lang.code).toBeDefined();
        expect(lang.name).toBeDefined();
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      });
    });

    it('should include Spanish and English as available languages', () => {
      const result = service.getAvailableLanguages();
      const codes = result.map(lang => lang.code);

      expect(codes).toContain('es');
      expect(codes).toContain('en');
    });
  });

  describe('Integration tests', () => {
    it('should maintain language selection across service calls', () => {

      service.setLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en');


      (localStorage.getItem as jest.Mock).mockReturnValue('en');
      translocoServiceSpy.setActiveLang.mockClear();

      service.initializeLanguage();
      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('en');
    });

    it('should handle language switching workflow', () => {

      service.setLanguage('es');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'es');


      service.setLanguage('en');
      expect(localStorage.setItem).toHaveBeenCalledWith('selectedLanguage', 'en');
      expect(translocoServiceSpy.setActiveLang).toHaveBeenCalledWith('en');

      const availableLanguages = service.getAvailableLanguages();
      const codes = availableLanguages.map(lang => lang.code);
      expect(codes).toContain('es');
      expect(codes).toContain('en');
    });
  });
});

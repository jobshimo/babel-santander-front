import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private translocoService: TranslocoService) {}

  setLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    localStorage.setItem('selectedLanguage', lang);
  }

  getCurrentLanguage(): string {
    return this.translocoService.getActiveLang() || 'es';
  }

  initializeLanguage(): void {
    const savedLang = localStorage.getItem('selectedLanguage');
    const langToUse = savedLang && ['es', 'en'].includes(savedLang) ? savedLang : 'es';

    this.translocoService.setActiveLang(langToUse);
  }

  getAvailableLanguages() {
    return [
      { code: 'es', name: 'languages.es' },
      { code: 'en', name: 'languages.en' }
    ];
  }
}

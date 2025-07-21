import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, TranslocoModule, CommonModule],
  template: `
    <mat-form-field appearance="outline" class="language-selector">
      <mat-label>{{ 'app.language' | transloco }}</mat-label>
      <mat-select [value]="currentLanguage" (selectionChange)="onLanguageChange($event.value)">
        <mat-option *ngFor="let lang of availableLanguages" [value]="lang.code">
          {{ lang.name | transloco }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .language-selector {
      min-width: 120px;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  currentLanguage = '';
  availableLanguages: {code: string; name: string}[] = [];

  private languageService = inject(LanguageService);
  private translocoService = inject(TranslocoService);

  ngOnInit() {
    this.languageService.initializeLanguage();

    this.currentLanguage = this.languageService.getCurrentLanguage();

    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  onLanguageChange(language: string) {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }
}

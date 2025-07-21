import { Component } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';

export const MOCK_TRANSLATIONS = {
  es: {
    'app.title': 'Sistema de Gestión de Candidatos',
    'app.language': 'Idioma',
    'candidate.name': 'Nombre',
    'candidate.surname': 'Apellido',
    'candidate.seniority': 'Seniority',
    'candidate.experience': 'Años de experiencia',
    'candidate.availability': 'Disponibilidad',
    'candidate.junior': 'Junior',
    'candidate.semi-senior': 'Semi Senior',
    'candidate.senior': 'Senior',
    'candidate.available': 'Disponible',
    'candidate.notAvailable': 'No disponible',
    'form.submit': 'Enviar',
    'form.reset': 'Resetear',
    'form.refresh': 'Refrescar datos',
    'form.required': 'Este campo es obligatorio',
    'file.select': 'Seleccionar archivo',
    'file.drop': 'O arrastrar y soltar archivo aquí',
    'file.uploading': 'Subiendo archivo...',
    'file.processing': 'Procesando archivo...',
    'file.error': 'Error al procesar el archivo',
    'file.unsupported': 'Formato de archivo no soportado',
    'file.invalidFormat': 'El archivo CSV debe tener las columnas: name, surname, seniority, yearsOfExperience, availability',
    'api.online': 'API en línea',
    'api.offline': 'API desconectada - usando datos en caché',
    'api.checking': 'Verificando estado de la API...',
    'messages.success': 'Operación completada exitosamente',
    'messages.error': 'Error al procesar la solicitud',
    'messages.candidateAdded': 'Candidato agregado exitosamente',
    'messages.dataRefreshed': 'Datos actualizados',
    'languages.es': 'Español',
    'languages.en': 'English',
    'candidateForm.errors.fileInvalidFormat': 'Formato de archivo inválido. Solo se permiten archivos .xlsx y .csv',
    'candidateForm.errors.fileReadError': 'Error al leer el archivo',
    'status.hasData': '{{count}} candidato(s) registrado(s)',
    'status.noData': 'No hay candidatos registrados',
    'status.loading': 'Cargando',
    'status.error': 'Error al cargar los datos',
    'success.candidateRegistered': 'Candidato registrado exitosamente'
  },
  en: {
    'app.title': 'Candidate Management System',
    'app.language': 'Language',
    'candidate.name': 'Name',
    'candidate.surname': 'Surname',
    'candidate.seniority': 'Seniority',
    'candidate.experience': 'Years of experience',
    'candidate.availability': 'Availability',
    'candidate.junior': 'Junior',
    'candidate.semi-senior': 'Semi Senior',
    'candidate.senior': 'Senior',
    'candidate.available': 'Available',
    'candidate.notAvailable': 'Not available',
    'form.submit': 'Submit',
    'form.reset': 'Reset',
    'form.refresh': 'Refresh data',
    'form.required': 'This field is required',
    'file.select': 'Select file',
    'file.drop': 'Or drag and drop file here',
    'file.uploading': 'Uploading file...',
    'file.processing': 'Processing file...',
    'file.error': 'Error processing file',
    'file.unsupported': 'Unsupported file format',
    'file.invalidFormat': 'CSV file must have columns: name, surname, seniority, yearsOfExperience, availability',
    'api.online': 'API online',
    'api.offline': 'API offline - using cached data',
    'api.checking': 'Checking API status...',
    'messages.success': 'Operation completed successfully',
    'messages.error': 'Error processing request',
    'messages.candidateAdded': 'Candidate added successfully',
    'messages.dataRefreshed': 'Data refreshed',
    'languages.es': 'Español',
    'languages.en': 'English',
    'candidateForm.errors.fileInvalidFormat': 'Invalid file format. Only .xlsx and .csv files are allowed',
    'candidateForm.errors.fileReadError': 'Error reading file',
    'status.hasData': '{{count}} candidate(s) registered',
    'status.noData': 'No candidates registered',
    'status.loading': 'Loading',
    'status.error': 'Error loading data',
    'success.candidateRegistered': 'Candidate successfully registered'
  }
};

/**
 * Creates a TranslocoTestingModule for use in tests
 */
export function getTranslocoTestingModule() {
  return TranslocoTestingModule.forRoot({
    langs: MOCK_TRANSLATIONS,
    translocoConfig: {
      availableLangs: ['es', 'en'],
      defaultLang: 'es'
    }
  });
}

/**
 * Mock component for testing Transloco integration
 */
@Component({
  template: ''
})
export class MockTranslocoComponent {
}

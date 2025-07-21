import { Injectable, inject } from '@angular/core';
import { IFileParser } from '../models/file-parser.model';
import { CsvFileParser } from './csv-parser.service';
import { ExcelFileParser } from './excel-parser.service';

/**
 * Factory para obtener el parser apropiado según el tipo de archivo
 */
@Injectable({
  providedIn: 'root'
})
export class FileParserFactory {
  private readonly excelParser = inject(ExcelFileParser);
  private readonly csvParser = inject(CsvFileParser);
  private readonly parsers: readonly IFileParser[];

  constructor() {
    this.parsers = [this.excelParser, this.csvParser];
  }

  /**
   * Obtiene el parser apropiado para el archivo dado
   * @param file - Archivo a parsear
   * @returns Parser apropiado o null si no se encuentra
   */
  getParser(file: File): IFileParser | null {
    return this.parsers.find(parser => parser.canParse(file)) || null;
  }

  /**
   * Obtiene todos los tipos de archivo soportados
   * @returns Array con todas las extensiones soportadas
   */
  getSupportedTypes(): readonly string[] {
    return this.parsers.flatMap(parser => parser.supportedTypes);
  }

  /**
   * Verifica si un archivo es soportado
   * @param file - Archivo a verificar
   * @returns true si el archivo es soportado
   */
  isSupported(file: File): boolean {
    return this.getParser(file) !== null;
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { FileData } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  parseExcelFile(file: File): Observable<FileData> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length !== 1) {
            observer.error(new Error('El archivo debe contener exactamente una fila de datos'));
            return;
          }

          const row = jsonData[0] as any;

          if (!row.hasOwnProperty('seniority') ||
              !row.hasOwnProperty('yearsOfExperience') ||
              !row.hasOwnProperty('availability')) {
            observer.error(new Error('El archivo debe contener las columnas: seniority, yearsOfExperience, availability'));
            return;
          }

          if (row.seniority !== 'junior' && row.seniority !== 'senior') {
            observer.error(new Error('El campo seniority debe ser "junior" o "senior"'));
            return;
          }

          if (typeof row.yearsOfExperience !== 'number' || row.yearsOfExperience < 0) {
            observer.error(new Error('El campo yearsOfExperience debe ser un número positivo'));
            return;
          }

          if (typeof row.availability !== 'boolean') {
            observer.error(new Error('El campo availability debe ser un booleano'));
            return;
          }

          const fileData: FileData = {
            seniority: row.seniority,
            yearsOfExperience: row.yearsOfExperience,
            availability: row.availability
          };

          observer.next(fileData);
          observer.complete();
        } catch (error) {
          observer.error(new Error('Error al leer el archivo: ' + error));
        }
      };

      reader.onerror = () => {
        observer.error(new Error('Error al leer el archivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  parseCSVFile(file: File): Observable<FileData> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          const lines = csvData.split('\n').filter(line => line.trim() !== '');

          if (lines.length !== 2) {
            observer.error(new Error('El archivo CSV debe contener exactamente una fila de datos (además del encabezado)'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const values = lines[1].split(',').map(v => v.trim());

          if (headers.length !== values.length) {
            observer.error(new Error('El número de columnas no coincide'));
            return;
          }

          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });

          if (!row.hasOwnProperty('seniority') ||
              !row.hasOwnProperty('yearsOfExperience') ||
              !row.hasOwnProperty('availability')) {
            observer.error(new Error('El archivo debe contener las columnas: seniority, yearsOfExperience, availability'));
            return;
          }

          if (row.seniority !== 'junior' && row.seniority !== 'senior') {
            observer.error(new Error('El campo seniority debe ser "junior" o "senior"'));
            return;
          }

          const yearsOfExperience = parseInt(row.yearsOfExperience, 10);
          if (isNaN(yearsOfExperience) || yearsOfExperience < 0) {
            observer.error(new Error('El campo yearsOfExperience debe ser un número positivo'));
            return;
          }

          const availability = row.availability.toLowerCase() === 'true';
          if (row.availability.toLowerCase() !== 'true' && row.availability.toLowerCase() !== 'false') {
            observer.error(new Error('El campo availability debe ser "true" o "false"'));
            return;
          }

          const fileData: FileData = {
            seniority: row.seniority,
            yearsOfExperience: yearsOfExperience,
            availability: availability
          };

          observer.next(fileData);
          observer.complete();
        } catch (error) {
          observer.error(new Error('Error al leer el archivo CSV: ' + error));
        }
      };

      reader.onerror = () => {
        observer.error(new Error('Error al leer el archivo'));
      };

      reader.readAsText(file);
    });
  }
}

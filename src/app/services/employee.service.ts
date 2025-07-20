import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiStatus, Employee, EmployeeResponse } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/candidates';
  private readonly STORAGE_KEY = 'candidatesData';
  private readonly STATUS_KEY = 'apiStatus';

  private apiStatusSubject = new BehaviorSubject<ApiStatus>({
    online: true,
    lastCheck: new Date(),
    usingCachedData: false
  });

  public apiStatus$ = this.apiStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCachedApiStatus();
  }

  private loadCachedApiStatus(): void {
    try {
      const cachedStatus = localStorage.getItem(this.STATUS_KEY);
      if (cachedStatus) {
        const status = JSON.parse(cachedStatus);
        this.apiStatusSubject.next(status);
      }
    } catch (error) {
      console.error('Error loading cached API status:', error);
    }
  }

  private checkApiStatus(): void {
    this.http.get(this.apiUrl, { observe: 'response' }).subscribe({
      next: () => {
        const currentStatus = this.apiStatusSubject.value;
        if (!currentStatus.online || currentStatus.usingCachedData) {
          this.updateApiStatus(true, false);
        }
      },
      error: () => {
        const currentStatus = this.apiStatusSubject.value;
        if (currentStatus.online || !currentStatus.usingCachedData) {
          this.updateApiStatus(false, true);
        }
      }
    });
  }

  private updateApiStatus(online: boolean, usingCachedData: boolean): void {
    const status: ApiStatus = {
      online,
      lastCheck: new Date(),
      usingCachedData
    };
    this.apiStatusSubject.next(status);
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(status));
  }

  getAllCandidates(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.apiUrl).pipe(
      tap(candidates => {
        this.saveCandidatesToStorage(candidates);
        const currentStatus = this.apiStatusSubject.value;
        if (!currentStatus.online || currentStatus.usingCachedData) {
          this.updateApiStatus(true, false);
        }
      }),
      catchError(error => {
        console.error('API no disponible:', error);
        const currentStatus = this.apiStatusSubject.value;
        if (currentStatus.online || !currentStatus.usingCachedData) {
          this.updateApiStatus(false, true);
        }
        throw error;
      })
    );
  }

  getAllCandidatesWithFallback(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.apiUrl).pipe(
      tap(candidates => {
        this.saveCandidatesToStorage(candidates);
        const currentStatus = this.apiStatusSubject.value;
        if (!currentStatus.online || currentStatus.usingCachedData) {
          this.updateApiStatus(true, false);
        }
      }),
      catchError(error => {
        console.error('API no disponible, usando datos del storage:', error);
        const currentStatus = this.apiStatusSubject.value;
        if (currentStatus.online || !currentStatus.usingCachedData) {
          this.updateApiStatus(false, true);
        }
        const cachedData = this.getCachedCandidates();
        return of(cachedData);
      })
    );
  }

  submitEmployee(employee: Employee, file: File): Observable<EmployeeResponse> {
    const formData = new FormData();
    formData.append('name', employee.name);
    formData.append('surname', employee.surname);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<EmployeeResponse>(this.apiUrl, formData).pipe(
      tap(() => {
        const currentStatus = this.apiStatusSubject.value;
        if (!currentStatus.online || currentStatus.usingCachedData) {
          this.updateApiStatus(true, false);
        }
      }),
      map(response => ({
        ...response,
        timestamp: new Date()
      })),
      catchError(error => {
        console.error('Error submitting employee:', error);
        const currentStatus = this.apiStatusSubject.value;
        if (currentStatus.online || !currentStatus.usingCachedData) {
          this.updateApiStatus(false, true);
        }
        return throwError(() => error);
      })
    );
  }

  private saveCandidatesToStorage(candidates: EmployeeResponse[]): void {
    const dataWithTimestamp = {
      candidates,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  }

  private getCachedCandidates(): EmployeeResponse[] {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return parsed.candidates || [];
      }
    } catch (error) {
      console.error('Error parsing cached data:', error);
    }
    return [];
  }

  getCachedDataInfo(): { candidates: EmployeeResponse[], lastUpdated: Date | null } {
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return {
          candidates: parsed.candidates || [],
          lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null
        };
      }
    } catch (error) {
      console.error('Error parsing cached data:', error);
    }
    return { candidates: [], lastUpdated: null };
  }

  forceApiCheck(): void {
    this.checkApiStatus();
  }
}

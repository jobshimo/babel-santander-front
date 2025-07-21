import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, BrowserAnimationsModule]
    });
    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success message', () => {
    const spy = jest.spyOn(snackBar, 'open');
    service.showSuccess('Success message');
    expect(spy).toHaveBeenCalledWith('Success message', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  });

  it('should show error message', () => {
    const spy = jest.spyOn(snackBar, 'open');
    service.showError('Error message');
    expect(spy).toHaveBeenCalledWith('Error message', 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  });

  it('should show warning message', () => {
    const spy = jest.spyOn(snackBar, 'open');
    service.showWarning('Warning message');
    expect(spy).toHaveBeenCalledWith('Warning message', 'Cerrar', {
      duration: 5000,
      panelClass: ['warning-snackbar']
    });
  });
});

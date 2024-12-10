import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerStatusService {
  public spinnerSubject$ =  new BehaviorSubject<boolean>(false);
  public readonly spinner$ = this.spinnerSubject$.asObservable();

  public showSpinner(status: boolean): void {
    setTimeout(() => this.spinnerSubject$.next(status), 0);
   
  }
}

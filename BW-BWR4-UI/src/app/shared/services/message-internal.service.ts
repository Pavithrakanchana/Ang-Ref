import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageInternalService {

  public errorSubject$ = new Subject<string[]>();
  public softErrorSubject$ = new Subject<string[]>();

  public get error$() {
    return this.errorSubject$.asObservable();
  }
  public get softError$() {
    return this.softErrorSubject$.asObservable();
  }
   clearMessages(): void {
    this.errorSubject$.next();
  }
  clearSoftMessages(): void {
    this.softErrorSubject$.next();
  }

  clearAllMessages(): void {
    this.errorSubject$.next();
    this.softErrorSubject$.next();
  }
}

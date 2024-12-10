import { Injectable } from '@angular/core';
import { MessageInternalService } from './message-internal.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private readonly internalService: MessageInternalService) { }

  public showError(message: string[]): void {
    message = message?.filter(x => x !== '' && x != null && x !== undefined) || [];
    if (message?.length > 0) {
      this.internalService.errorSubject$.next(message);
    }
    // message = message.filter(x => x !== '' || x != null);
    // this.internalService.errorSubject$.next(message);
  }
  public softError(message: string[]): void {
    message = message?.filter(x => x !== '' && x != null && x !== undefined) || [];
    if (message?.length > 0) {
      this.internalService.softErrorSubject$.next(message);
    }    
  }

  public clearErrors(): any {
    this.internalService.clearMessages();
    return [];
  }

  public clearSoftErrors(): any {
    this.internalService.clearSoftMessages();
    return [];
  }

  public clearAllErrors(): any {
    this.internalService.clearAllMessages();
    return [];
  }
}

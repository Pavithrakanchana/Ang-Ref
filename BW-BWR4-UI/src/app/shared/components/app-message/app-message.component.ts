import { Component, OnInit } from '@angular/core';
import { BWMessage } from '../../model/message.model';
import { MessageInternalService } from '../../services/message-internal.service';

@Component({
  selector: 'app-messages',
  templateUrl: './app-message.component.html',
  styleUrls: ['./app-message.component.scss']
})
export class AppMessageComponent implements OnInit {

  appMessages: BWMessage[] = [];
  error$ = this.internalservice.error$;
  softError$ = this.internalservice.softError$;
  constructor(private readonly internalservice: MessageInternalService ) { }
  ngOnInit() {

  }
}

import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import QuoteSummary from 'src/app/state/model/summary.model';
import { ChatRequest } from '../../model/chat/chatrequest';
import { ChatResponse } from '../../model/chat/chatres';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from 'src/app/constants/global.constant';

declare global {
  interface Window {
    embedded_svc: any;
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatreq!: ChatRequest;
  chatres!: ChatResponse;
  mco!: any;
  producerCode!: string;
  agentFirstName!: string;
  agentLastName!: string;
  producerType!: string;
  stateCode!: string;
  sourceURL!: string;
  w!: number;
  h!: number;
  win!: any;
  disableChatButton!: boolean;
  scriptUrl!: string;
  embedded_svc!: any;
  window!: any;
  params: any;


  constructor(private store: Store<{ quoteSummary: QuoteSummary }>,
    private router: Router) {
    this.store.select('quoteSummary').subscribe(data => {
      this.mco = data.mco;
      this.producerCode = data.producerCode;
      this.agentFirstName = data.producerUserFirstName;
      this.agentLastName = data.producerUserLastName;
      this.producerType = data.channel;
      this.stateCode = data.policyState;
    });
  }

  ngOnInit(): void {
  }



  clickChat() {
    this.disableChatButton = true;
    /*
    var params  = { 'AgentAgencyName__c': 'BWP',
    'AgentFirstName__c': this.agentFirstName,
    'AgentLastName__c': this.agentLastName,
    'MCO__c': this.mco,
    'Page_Name__c': this.router.url,
    'Producer_Code__c': this.producerCode,
    'ProducerType': this.producerType,
    'QueueId__c': "3002",
    'State_Code__c': this.stateCode
  };

    var form = document.createElement("form");
    form.setAttribute("method", "post");
  // form.setAttribute("action", url);
   // form.setAttribute("target", name);

   for (const i in params) {
    {
      if (params.hasOwnProperty(i))
      {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = i;
       input.value = params[i]
        form.appendChild(input);
      }
    }
  }

    document.body.appendChild(form);
    // console.log('form:'+form);
    */

    this.params = new HttpParams();
    this.params = this.params.set('AgentAgencyName__c', GlobalConstants.AGENCY_NAME);
    this.params = this.params.set('AgentFirstName__c', this.agentFirstName);
    this.params = this.params.set('AgentLastName__c', this.agentLastName);
    this.params = this.params.set('MCO__c', this.mco);
    this.params = this.params.set('Page_Name__c', this.router.url);
    this.params = this.params.set('Producer_Code__c', this.producerCode);
    this.params = this.params.set('ProducerType', this.producerType);
    this.params = this.params.set('QueueId__c', '3002'); //4002 for CA-MCO44
    this.params = this.params.set('State_Code__c', this.stateCode);

    // default sizes
    this.w = 400;
    this.h = 440;

    //  this.win = window.open('../../../assets/html/agent_chat.html' + '?' + this.params.toString(), 'Chat_Window1', 'width=' + this.w + ',height=' + this.h);
   if(!environment.production){
    this.win = window.open('../../../assets/html/bwchatq.html'+ '?' + encodeURIComponent(this.params.toString()), 'chat1', 'width=' + this.w + ',height=' + this.h);
   }else {
      this.win = window.open('../../../assets/html/bwchatp.html'+ '?' + encodeURIComponent(this.params.toString()), 'chat1', 'width=' + this.w + ',height=' + this.h);
    }

    // Check each 1 millisec whether chat window is closed, then enable the CHat button.
    const chatInterval = setInterval(
      () => {
        if (this.win !== null && this.win?.closed) { // when chat window is closed, then enable the CHAT button again
          this.disableChatButton = false;
          clearInterval(chatInterval);
        }
      }, 1000); // 1millisec

  }


  /*openNewWindow(valueObject: any): void {
    const url = valueObject.url;
    const name = 'Test';
    const params = {id : '12345'};
    const form = document.createElement('FORM');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', url);
    form.setAttribute('target', name);
    for (const index in params) {
      if (params.hasOwnProperty(index)) {
        const input = document.createElement('input');
        input.name = index;
        input.value = params.get[index];
        form.appendChild(input);
      }
    }
    document.body.appendChild(form);
    window.open(url, name);
    form.submit();
    document.body.removeChild(form);
  }*/
}

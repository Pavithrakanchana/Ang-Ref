import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import QuoteSummary from '../state/model/summary.model';
import { $ } from 'protractor';

@Injectable({
  providedIn: 'root'
})

export class HelpTextService {
  mco!: string;
  agentCode: any;
  producerCode: any;
  constructor(private httpClient: HttpClient,  private store: Store<{ quoteSummary: QuoteSummary }>) { }

  public getHelpText(mco: string, agentCode: string): any {
    this.producerCode = agentCode.substring(0, 2);
    const helpTextURL = `${environment.baseWASUrl}`+'PolicyHolderREST/getAllHelpText?appid=BWR&mco='+mco+'&state='+this.producerCode+'&ratebook=All&lob=APV';
    return this.httpClient.get(helpTextURL);
   //return this.httpClient.get(`${environment.baseWASUrl}${environment.helpTextURL}`);
  }
}

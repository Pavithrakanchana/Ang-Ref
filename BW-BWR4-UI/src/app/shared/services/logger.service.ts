import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GlobalConstants } from 'src/app/constants/global.constant';
import QuoteSummary from 'src/app/state/model/summary.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public static log: LoggerService;
  private logFormat: LogFormat;
  private _http: HttpClient;
  userAgent = '';

  // meta data for browsers
  browser = [
    { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
    { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
    { name: 'Safari', value: 'Safari', version: 'Version' },
    { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
    { name: 'Opera', value: 'Opera', version: 'Opera' },
    { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
    { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
  ];

  header = [
    navigator.platform,
    navigator.userAgent,
    navigator.appVersion,
    navigator.vendor,
  ];

  // data for devices and os
   os = [
    { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
    { name: 'Windows', value: 'Win', version: 'NT' },
    { name: 'iPhone', value: 'iPhone', version: 'OS' },
    { name: 'iPad', value: 'iPad', version: 'OS' },
    { name: 'Kindle', value: 'Silk', version: 'Silk' },
    { name: 'Android', value: 'Android', version: 'Android' },
    { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
    { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
    { name: 'Macintosh', value: 'Mac', version: 'OS X' },
    { name: 'Linux', value: 'Linux', version: 'rv' },
    { name: 'Palm', value: 'Palm', version: 'PalmOS' }
  ];


  constructor(handler: HttpBackend, @Inject(PLATFORM_ID) private platformId: any, private store: Store<{ quoteSummary: QuoteSummary }>) {
    LoggerService.log = this;
    this.logFormat = new LogFormat();
    this._http = new HttpClient(handler);  // Logic to bypass the intecerptors for the spefic services

    if (isPlatformBrowser(this.platformId)) {
      this.userAgent = window.navigator.userAgent;
    }
    this.store.select('quoteSummary').subscribe(data => {
      this.logFormat.QuoteNumber = data.qid;
      this.logFormat.StateCode = data.policyState;
      this.logFormat.ProducerCode = data.producerCode;
      this.logFormat.QuoteSource = data.quoteSrc;
    });
  }

  info(className: string, methodName: string, functionName: string, message: string) {
    this.logFormat.MessageReference = '';
    this.logFormat.Class = className;
    this.logFormat.Method = methodName;
    this.logFormat.FunctionName = functionName;
    this.logFormat.SystemName = GlobalConstants.APP_NAME;
    this.logFormat.UserAgent = this.userAgent;
    this.logFormat.Message = message;

    this.postlog(GlobalConstants.LOGGER_INFO, this.logFormat)
      .subscribe(res => {
        // Tracker.log('Response from Logger ', res)
      });
  }

  error(className: string, methodName: string, functionName: string, message: string, error: any) {
    this.logFormat.MessageReference = '';
    this.logFormat.Class = className;
    this.logFormat.Method = methodName;
    this.logFormat.FunctionName = functionName;
    this.logFormat.SystemName = GlobalConstants.APP_NAME;
    this.logFormat.Message = message;
    this.logFormat.Error = error;
    this.logFormat.UserAgent = this.userAgent;

    this.postlog(GlobalConstants.LOGGER_ERROR, this.logFormat)
      .subscribe(res => { // Tracker.log('Response from Logger ', res)
      });
  }

  logTimining(serviceName: string, elapsedTime: string) {
    const timingslog = { 'serviceName': serviceName, elapsedTime };
    this.postlog(GlobalConstants.LOGGER_TIME, timingslog)
      .subscribe(res => {// Tracker.log('Response from Logger ', res)
      });
  }

  postlog(apipath: string, body: any): Observable<any> {
    return this._http.post(`${environment.loggerUrl}${apipath}`, body);
  }

// this funtion returns the respective browserInfo and deviceInfo by comparing navigatorInfo with the
  matchItem(navigatorInfo: string, data: any) {
    let i = 0,
      j = 0,
      regex,
      regexv,
      match,
      matches,
      version;
    for (i = 0; i < data.length; i += 1) {
      regex = new RegExp(data[i].value, 'i');
      match = regex.test(navigatorInfo);
      if (match) {
        regexv = new RegExp(data[i].version + '[- /:;]([\d._]+)', 'i');
        matches = navigatorInfo.match(regexv);
        version = '';
        if (matches) { if (matches[1]) { matches = matches[1]; } }
        if (matches) {
          matches = matches.toString().split(/[._]+/);
          for (j = 0; j < matches.length; j += 1) {
            if (j === 0) {
              version += matches[j] + '.';
            } else {
              version += matches[j];
            }
          }
        } else {
          version = '0';
        }
        return {
          name: data[i].name,
          version: parseFloat(version)
        };
      }
    }
    return { name: 'unknown', version: 0 };
  }

}

export class BaseLogFormat {
  MessageReference!: string;
  Class!: string;
  Method!: string;
  FunctionName!: string;
  SystemName!: string;
  Message!: string;
  UserAgent!: string;
  Error: any;
  DeviceType!: string;
  MobileType!: string;
}


/*
Custom Class to accomodate Project Specific Attributes to display in log
*/
export class LogFormat extends BaseLogFormat {
  StateCode?: string;
  ProducerCode?: string;
  QuoteSource?: string;
  QuoteNumber?: string;
}

export class TimingFormat {
  MessageReference!: string;
  Class!: string;
  ServiceName!: string;
  Status!: string;
  ElapsedTime!: string;
  Message!: string;
  Error: any;
}

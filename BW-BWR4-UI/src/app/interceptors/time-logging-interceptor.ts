import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap, finalize } from "rxjs/operators";
import { Tracker } from "../shared/utilities/tracker";

@Injectable()
export class TimeLoggingInterceptor implements HttpInterceptor {
    constructor(private logTracker: Tracker){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const started = Date.now();
        let ok: string;

        const logreqs = '/log/';

        // extend server response observable with logging
        return next.handle(req)
            .pipe(
                tap(
                    event => ok = event instanceof HttpResponse ? ',' + 'StatusCode:' + event.status + ', StatusText:' + event.statusText : '',
                    error => ok = error + ' FAILURE'
                ),
                finalize(() => {
                    const elapsed = Date.now() - started;
                    const msg = `${ok}, ElapsedTime:${elapsed} ms.`;
                    this.logTracker.logtime(`${req.urlWithParams}`, msg);
                })
            );
    }
}

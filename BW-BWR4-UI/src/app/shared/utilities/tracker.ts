import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { LoggerService } from "../services/logger.service";

@Injectable({
    providedIn: 'root'
 })
export class Tracker {
    constructor(private _loggerService: LoggerService) {}
    loginfo(className: string, methodName: string, functionName: string, msg: string) {
        const enableLogger = `${environment.enableLogger}`;
        if (enableLogger === 'true') {
            this._loggerService.info(className, methodName, functionName, msg);
        } else {
            //  console.log(className, methodName, functionName, msg);
        }
    }

    logerror(className: string, methodName: string, functionName: string, msg: string, error: any) {
        const enableLogger = `${environment.enableLogger}`;
        if (enableLogger === 'true') {
        LoggerService.log.error(className, methodName, functionName, msg, error);
        } else {
            // console.log(className, methodName, functionName, msg, error);
        }
    }

    logtime(serviceName: string, timingmsg: string) {
        const enableLogger = `${environment.enableLogger}`;
        if (enableLogger === 'true') {
        LoggerService.log.logTimining(serviceName, timingmsg);
        } else {
            // console.log(serviceName, timingmsg);
        }
    }

    public static gaevent() {}
}


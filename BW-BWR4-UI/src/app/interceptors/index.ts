import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HeaderInterceptor } from "./header-interceptor";
import { TimeLoggingInterceptor } from "./time-logging-interceptor";

export const bwr4HttpInterceptorProviders = [
  {
      provide: HTTP_INTERCEPTORS,
      useClass: HeaderInterceptor,
      multi: true
  },
  {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeLoggingInterceptor,
      multi: true
  }
];

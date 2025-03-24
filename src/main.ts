import { bootstrapApplication } from '@angular/platform-browser';
import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';

// This function will be used as an interceptor to log the request
// need to include in the request the type - in our case we will use unknown
// and the next function to continue the request
// the next function will return a promise with the response
// the function will be used as an interceptor in the provideHttpClient function
function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    // it is possible to clone the request here and modify it
    // for example to add headers
    const clonedReq = req.clone({
        headers: req.headers.set('X-Request-Id', '1234')
    })
    console.log('Request sent', clonedReq);
    return next(clonedReq)
}

bootstrapApplication(AppComponent , {
    // in order to register the different interceptors function need to the add 
    // withInterceptors function to the provideHttpClient function
    // and pass the array of interceptors funcions
    providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
}).catch((err) => console.error(err));




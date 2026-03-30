import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { BBPluginImplModule } from '../plugin/impl';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { AuthService } from './auth/services/auth.service';

/**
 * Reads TOKEN_ID and JSESSIONID from URL hash params (passed by parent JSP via iframe src)
 * and stores them in sessionStorage BEFORE Angular routing starts.
 * This ensures the editor can access auth tokens when opened from iframe.
 */
function initAuthFromUrl(authService: AuthService) {
    return () => {
        const hash = window.location.hash;
        if (hash) {
            const queryPart = hash.split('?')[1];
            if (queryPart) {
                const params = new URLSearchParams(queryPart);
                const tokenId = params.get('TOKEN_ID');
                const jsessionId = params.get('JSESSIONID');
                if (tokenId) {
                    authService.updateTokenId(tokenId);
                }
                if (jsessionId) {
                    authService.updateJSessionId(jsessionId);
                }
            }
        }
    };
}

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    BBPluginImplModule,
    MatIconModule,
    RouterModule.forRoot(routes, { useHash: true }),
    AppComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthFromUrl,
      deps: [AuthService],
      multi: true
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

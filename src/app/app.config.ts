import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { AuthService } from './auth/services/auth.service';

/**
 * Reads TOKEN_ID and JSESSIONID from URL hash params (passed by parent JSP via iframe src)
 * and stores them in sessionStorage BEFORE Angular routing starts.
 * This ensures authGuard sees the tokens and allows navigation to /editor.
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

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        {
            provide: APP_INITIALIZER,
            useFactory: initAuthFromUrl,
            deps: [AuthService],
            multi: true
        },
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([authInterceptor])
        )
    ]
};

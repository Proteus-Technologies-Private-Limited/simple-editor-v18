import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    // Skip auth headers for login endpoint
    if (req.url.includes('/loginApp')) {
        return next(req);
    }

    const authHeaders = authService.getAuthHeaders();

    if (Object.keys(authHeaders).length > 0) {
        const clonedReq = req.clone({
            setHeaders: authHeaders,
            withCredentials: true
        });
        return next(clonedReq);
    }

    return next(req);
};

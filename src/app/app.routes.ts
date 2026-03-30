import { Routes } from '@angular/router';
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { authGuard } from './auth/guards/auth.guard';
// import { guestGuard } from './auth/guards/guest.guard';
// import { AuthService } from './auth/services/auth.service';

/**
 * When opened from iframe, tokens (TOKEN_ID, JSESSIONID) are passed via URL hash params.
 * The app should open the editor form directly without showing the login page.
 */

// Login form guard - commented out as iframe provides auth tokens directly
// const rootRedirectGuard: CanActivateFn = () => {
//     const authService = inject(AuthService);
//     const router = inject(Router);
//
//     if (authService.isAuthenticated()) {
//         router.navigate(['/editor']);
//     } else {
//         router.navigate(['/login']);
//     }
//     return false;
// };

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'editor'
    },
    // Login route - commented out as iframe provides auth tokens directly
    // {
    //     path: 'login',
    //     loadComponent: () => import('./auth/login/login.component'),
    //     canActivate: [guestGuard]
    // },
    {
        path: 'editor',
        loadComponent: () => import('./editor/editor-wrapper.component')
        // canActivate: [authGuard]  // Commented out - iframe provides auth tokens via URL
    },
    {
        path: '**',
        redirectTo: 'editor'
    }
];

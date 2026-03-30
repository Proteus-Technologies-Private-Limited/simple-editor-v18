import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export default class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Editor parameters
    objName = 'sorder';
    editFlag = 'A';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            userCode: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const { userCode, password } = this.loginForm.value;

        this.authService.login(userCode, password).subscribe({
            next: (response) => {
                console.log('Login response:', response);

                // Check for error in response
                if (response?.status === 'error' || response?.Errors) {
                    let errorMsg = 'Login failed. Please check your credentials.';

                    // Extract error message from various response formats
                    if (response?.Errors?.error?.message) {
                        errorMsg = response.Errors.error.message;
                    } else if (response?.data?.error?.message) {
                        errorMsg = response.data.error.message;
                    } else if (response?.message) {
                        errorMsg = response.message;
                    } else if (response?.data && typeof response.data === 'string') {
                        errorMsg = response.data;
                    }

                    this.errorMessage = errorMsg;
                    this.isLoading = false;
                    return;
                }

                if (response?.status === 'success' || this.authService.isAuthenticated()) {
                    this.successMessage = 'Login successful! Redirecting...';

                    // Get return URL or default to editor
                    const returnUrl = sessionStorage.getItem('returnUrl') || '/editor';
                    sessionStorage.removeItem('returnUrl');

                    setTimeout(() => {
                        // Navigate to editor with query params
                        this.router.navigate(['/editor'], {
                            queryParams: {
                                OBJ_NAME: this.objName,
                                EDIT_FLAG: this.editFlag
                            }
                        });
                    }, 1000);
                } else {
                    // Extract error message from response
                    let errorMsg = 'Login failed. Please check your credentials.';
                    if (response?.data?.error?.message) {
                        errorMsg = response.data.error.message;
                    } else if (response?.data && typeof response.data === 'string') {
                        errorMsg = response.data;
                    } else if (response?.message) {
                        errorMsg = response.message;
                    }
                    this.errorMessage = errorMsg;
                    this.isLoading = false;
                }
            },
            error: (error) => {
                console.error('Login error:', error);
                // Extract error message from various error formats
                let errorMsg = 'Login failed. Please try again.';
                if (error?.error?.Errors?.error?.message) {
                    errorMsg = error.error.Errors.error.message;
                } else if (error?.error?.message) {
                    errorMsg = error.error.message;
                } else if (error?.error?.data) {
                    errorMsg = error.error.data;
                } else if (error?.message) {
                    errorMsg = error.message;
                } else if (error?.statusText) {
                    errorMsg = `${error.statusText} (${error.status})`;
                }
                this.errorMessage = errorMsg;
                this.isLoading = false;
            }
        });
    }
}

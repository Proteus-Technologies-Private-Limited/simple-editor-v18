import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = '';

    private isAuthenticatedSignal = signal<boolean>(this.hasStoredToken());
    private tokenIdSignal = signal<string | null>(this.getStoredToken());
    private jsessionIdSignal = signal<string | null>(this.getStoredJSessionId());

    constructor(private http: HttpClient) {}

    private hasStoredToken(): boolean {
        return !!sessionStorage.getItem('TOKEN_ID');
    }

    private getStoredToken(): string | null {
        return sessionStorage.getItem('TOKEN_ID');
    }

    private getStoredJSessionId(): string | null {
        return sessionStorage.getItem('JSESSIONID');
    }

    isAuthenticated(): boolean {
        return this.isAuthenticatedSignal();
    }

    getTokenId(): string | null {
        return this.tokenIdSignal();
    }

    getJSessionId(): string | null {
        return this.jsessionIdSignal();
    }

    login(userCode: string, password: string): Observable<any> {
        const formData = new URLSearchParams();
        formData.append('USER_CODE', userCode);
        formData.append('PASSWORD', password);
        formData.append('APP_ID', 'FLUTTERAPP');
        formData.append('IS_PWD_ENCRYPT', 'false');
        formData.append('DATA_FORMAT', 'JSON');

        return this.http.post(
            `${this.API_URL}/ibase/rest/E12ExtService/loginApp`,
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true,
                observe: 'response'
            }
        ).pipe(
            tap(response => {
                console.log('Login response:', response);
                const body: any = response.body;

                // Extract TOKEN_ID from various response formats
                let tokenId = body?.TOKEN_ID || body?.token_id || body?.tokenId ||
                              body?.token || body?.sessionToken || body?.access_token;

                if (!tokenId && body?.data) {
                    tokenId = body.data.TOKEN_ID || body.data.token_id || body.data.tokenId;
                }
                if (!tokenId && body?.result) {
                    tokenId = body.result.TOKEN_ID || body.result.token_id || body.result.tokenId;
                }
                // Check if body itself is a string containing token info
                if (!tokenId && typeof body === 'string') {
                    try {
                        const parsed = JSON.parse(body);
                        tokenId = parsed?.TOKEN_ID || parsed?.token_id;
                    } catch (e) {
                        // Not JSON, ignore
                    }
                }

                if (tokenId) {
                    sessionStorage.setItem('TOKEN_ID', tokenId);
                    this.tokenIdSignal.set(tokenId);
                    this.isAuthenticatedSignal.set(true);
                    console.log('TOKEN_ID stored:', tokenId);
                }

                // Extract JSESSIONID from response body or headers
                let jsessionId = body?.JSESSIONID || body?.jsessionId || body?.sessionId;
                if (!jsessionId && body?.data) {
                    jsessionId = body.data.JSESSIONID || body.data.jsessionId;
                }
                // Try to get from response headers (Set-Cookie)
                if (!jsessionId) {
                    const cookies = response.headers.get('Set-Cookie');
                    if (cookies) {
                        const match = cookies.match(/JSESSIONID=([^;]+)/);
                        if (match) {
                            jsessionId = match[1];
                        }
                    }
                }

                if (jsessionId) {
                    sessionStorage.setItem('JSESSIONID', jsessionId);
                    this.jsessionIdSignal.set(jsessionId);
                    // Set JSESSIONID as browser cookie to match server expectations
                    document.cookie = `JSESSIONID=${jsessionId}; path=/`;
                    console.log('JSESSIONID stored:', jsessionId);
                }

                const userName = body?.USER_NAME || body?.userName || body?.user_name ||
                                 body?.data?.USER_NAME || body?.data?.userName;
                if (userName) {
                    sessionStorage.setItem('USER_NAME', userName);
                }
            }),
            map(response => response.body)
        );
    }

    logout(): void {
        sessionStorage.removeItem('TOKEN_ID');
        sessionStorage.removeItem('JSESSIONID');
        sessionStorage.removeItem('USER_NAME');
        this.tokenIdSignal.set(null);
        this.jsessionIdSignal.set(null);
        this.isAuthenticatedSignal.set(false);
        // Clear JSESSIONID cookie
        document.cookie = 'JSESSIONID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    getAuthHeaders(): { [key: string]: string } {
        const headers: { [key: string]: string } = {};
        const tokenId = this.getTokenId();
        const jsessionId = this.getJSessionId();

        if (tokenId) {
            headers['TOKEN_ID'] = tokenId;
        }
        if (jsessionId) {
            headers['JSESSIONID'] = jsessionId;
        }
        return headers;
    }

    // Method to update JSESSIONID when received from API responses (e.g., getAddData)
    updateJSessionId(jsessionId: string): void {
        if (jsessionId) {
            sessionStorage.setItem('JSESSIONID', jsessionId);
            this.jsessionIdSignal.set(jsessionId);
            // Set JSESSIONID as browser cookie to match server expectations
            document.cookie = `JSESSIONID=${jsessionId}; path=/`;
            console.log('JSESSIONID updated:', jsessionId);
        }
    }

    // Method to update TOKEN_ID when received from API responses
    updateTokenId(tokenId: string): void {
        if (tokenId) {
            sessionStorage.setItem('TOKEN_ID', tokenId);
            this.tokenIdSignal.set(tokenId);
            this.isAuthenticatedSignal.set(true);
            console.log('TOKEN_ID updated:', tokenId);
        }
    }
}

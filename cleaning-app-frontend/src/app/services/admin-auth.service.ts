import { Injectable } from '@angular/core';

const ADMIN_TOKEN_KEY = 'cleaning_app_admin_token';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  getToken(): string | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  }

  setToken(token: string): void {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  clearToken(): void {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

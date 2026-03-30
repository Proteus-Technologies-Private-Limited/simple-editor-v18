import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'proteus-components',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-editor-plugin';

  constructor(private authService: AuthService) {
    this.listenForAuthMessages();
  }

  private listenForAuthMessages(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === 'AUTH_INIT') {
        if (event.data.TOKEN_ID) {
          this.authService.updateTokenId(event.data.TOKEN_ID);
        }
        if (event.data.JSESSIONID) {
          this.authService.updateJSessionId(event.data.JSESSIONID);
        }
        // Login form navigation - commented out as editor opens directly from iframe
        // if (this.authService.isAuthenticated()) {
        //   const returnUrl = sessionStorage.getItem('returnUrl') || '/editor';
        //   this.router.navigateByUrl(returnUrl);
        // }
      }
    });
  }
}

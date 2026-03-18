import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('🚀 Angular app starting...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('✅ Angular app bootstrapped successfully'))
  .catch((err) => {
    console.error('❌ Angular bootstrap error:', err);
    console.error(err);
  });

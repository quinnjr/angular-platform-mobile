/**
 * Sample Angular Android Application
 * Demonstrates the usage of angular-platform-mobile
 */

import { bootstrapAndroidApplication } from 'angular-platform-mobile';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapAndroidApplication(AppComponent, {
  config: {
    debug: true,
    packageName: 'com.example.sampleapp',
    hotReload: true,
  },
  providers: [provideAnimations()],
}).catch((err) => console.error('Bootstrap failed:', err));

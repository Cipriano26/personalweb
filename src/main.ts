import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'preline/dist';
// Asegura la carga del plugin de dropdown de Preline
import '@preline/dropdown';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

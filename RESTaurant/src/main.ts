import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

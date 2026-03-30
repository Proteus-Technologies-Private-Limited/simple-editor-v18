import 'hammerjs';
// import 'zone.js/dist/zone';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { EXPOSE_PLUGIN } from './plugin/utils/bb-plugin-util';
import { EXPOSE_DASHBOARD } from './plugin/utils/dashboard-plugin-util';

if (environment.production) {
  enableProdMode();
  // console.log enabled for debugging
  // console.log = () => {};
}

// platformBrowserDynamic().bootstrapModule(AppModule)
// .then(exposePlugins)
// .catch(err => console.log('Main TS Error : ',err));

//   function exposePlugins(injector: any) {
//     EXPOSE_PLUGIN(injector);
//     EXPOSE_DASHBOARD(injector);
// }

platformBrowserDynamic().bootstrapModule(AppModule)
    .then((moduleRef) => {
        const injector = moduleRef.injector;
        EXPOSE_PLUGIN(injector);  // Ensure injector is passed after app module is fully bootstrapped
        EXPOSE_DASHBOARD(injector);
    })
    .catch(err => console.log('Main TS Error:', err));

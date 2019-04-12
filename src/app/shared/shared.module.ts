import { NgModule } from '@angular/core';
import { AngularMaterialSharedComponentsModule } from './angular-material-shared-components/angular-material-shared-components.module';

@NgModule({
  exports: [
    AngularMaterialSharedComponentsModule,
  ]
})
export class SharedModule { }

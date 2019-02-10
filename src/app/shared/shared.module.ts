import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialSharedComponentsModule } from './angular-material-shared-components/angular-material-shared-components.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AngularMaterialSharedComponentsModule
  ],
  exports: [
    AngularMaterialSharedComponentsModule
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ActionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: []
})
export class ActionModule { }

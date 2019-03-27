import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { SharedModule } from '../shared/shared.module';
import { ActionService } from './services/action.service';

@NgModule({
  declarations: [
    ActionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    ActionService
  ]
})
export class ActionModule { }

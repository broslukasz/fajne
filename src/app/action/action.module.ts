import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { SharedModule } from '../shared/shared.module';
import { FirabaseStateCommunicationService } from '../core/firabase-state-communication.service';

@NgModule({
  declarations: [
    ActionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    FirabaseStateCommunicationService
  ]
})
export class ActionModule { }

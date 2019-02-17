import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeachComponent } from './speach.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    SpeachComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class SpeachModule { }

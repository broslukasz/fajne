import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action.component';
import { SharedModule } from '../shared/shared.module';
import { ChartModule } from 'angular-highcharts';

@NgModule({
  declarations: [
    ActionComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChartModule
  ],
})
export class ActionModule { }

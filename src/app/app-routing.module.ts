import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpeachComponent } from './speach/speach.component';

const appRoutes: Routes = [
  {path: 'speach', component: SpeachComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

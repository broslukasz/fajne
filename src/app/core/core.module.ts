import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from '../auth/auth.module';
import { FirabaseStateCommunicationService } from './firabase-state-communication.service';
import { AppStateComponent } from './app-state/app-state.component';

@NgModule({
  declarations: [
    AppStateComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AuthModule
  ],
  providers: [
    AngularFireDatabase,
    FirabaseStateCommunicationService
  ],
  exports: [
    AppStateComponent
  ]
})
export class CoreModule {

  constructor(@Optional() @SkipSelf() core: CoreModule) {
    if (core) {
      throw new Error('Core module imported multiple times!');
    }
  }
 }

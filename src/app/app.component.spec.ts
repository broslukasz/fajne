import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {CUSTOM_ELEMENTS_SCHEMA, Type} from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import {anyString, anything, instance, mock, when} from "ts-mockito";
import {Observable, of} from "rxjs";

const mockProvider = <T>(
  toMock: Type<T>,
  setupMock: (m: T) => void
): {
  provide: Type<T>;
  useFactory: () => T;
} => {
  const m = mock(toMock);
  setupMock(m);
  return { provide: toMock, useFactory: () => instance(m) };
};

describe('AppComponent', () => {
  let angularFireDatabaseMock: AngularFireDatabase = mock(AngularFireDatabase);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        mockProvider(AngularFireDatabase, m =>
          when(angularFireDatabaseMock.object(anyString())).thenReturn(<any>{
            valueChanges(): Observable<any | null> {
              return of(anything())
            }
          })
        ),
      ],
      declarations: [
        AppComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'fajne'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('fajne');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to fajne!');
  });
});

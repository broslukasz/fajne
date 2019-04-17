import { TestBed } from '@angular/core/testing';

import { ChartService } from './chart.service';
import { instance, mock } from 'ts-mockito';

describe('ChartService', () => {
  const chartServiceMock: ChartService = mock(ChartService);
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: ChartService, useValue: instance(chartServiceMock)},
    ]
  }));

  it('should be created', () => {
    const service: ChartService = TestBed.get(ChartService);
    expect(service).toBeTruthy();
  });
});

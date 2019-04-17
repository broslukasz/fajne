import { Injectable } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Injectable()
export class ChartService {
  private readonly data = [
    [1.23, Math.random()],
    [2, Math.random()],
    [3, Math.random()],
    [7.17, Math.random()],
    [8, Math.random()],
    [9, Math.random()],
    [20, Math.random()],
    [21, Math.random()],
    [22, Math.random()],
  ];

  private chart = new Chart({
    chart: {
      type: 'scatter',
      zoomType: 'xy'
    },
    title: {
      text: 'Reaction over time'
    },
    xAxis: {
      title: {
        enabled: true,
        text: 'Time'
      }
    },
    yAxis: {
      title: {
        enabled: false,
      }
    },
    series: [{
      name: 'All clicks',
      color: 'rgba(223, 83, 83, .5)',
      data: this.data,
      type: 'scatter'
    }]
  });

  getChart(): Chart {
    return this.chart;
  }
}

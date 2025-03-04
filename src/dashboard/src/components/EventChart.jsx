import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const EventChart = ({ eventData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (eventData.length === 0) return;

    const chart = echarts.init(chartRef.current);

    const options = {
      title: {
        text: '事件数据:PV/UV'
      },
      tooltip: {},
      legend: {
        data: ['PV', 'UV']
      },
      xAxis: {
        type: 'category',
        data: eventData.map(item => item.timestamp),  // X 轴为时间戳
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'PV',
          type: 'line',
          data: eventData.map(item => item.pv),  // PV 数据
        },
        {
          name: 'UV',
          type: 'line',
          data: eventData.map(item => item.uv),  // UV 数据
        },
      ],
    };

    chart.setOption(options);
  }, [eventData]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default EventChart;


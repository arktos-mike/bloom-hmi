import { Pie } from '@ant-design/plots';
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {
  const DemoPie = () => {
    const config = {
      autoFit: true,
      appendPadding: 10,
      data: [{ value: 10, reason: 'button' }, { value: 50, reason: 'run' }, { value: 3, reason: 'other' }],
      angleField: 'value',
      colorField: 'reason',
      radius: 1,
      innerRadius: 0.3,
      legend: false,
      label: {
        type: 'inner',
        offset: '-50%',
        content: '',
        style: {
          textAlign: 'center',
          fontSize: 14,
        },
      },
      pieStyle: ({ reason }) => {
        if (reason == 'other') { return { fill: '#000000FF' } }
        else if (reason == 'button') { return { fill: '#7339ABFF' } }
        else if (reason == 'warp') { return { fill: '#FF7F27FF' } }
        else if (reason == 'weft') { return { fill: '#FFB300FF' } }
        else if (reason == 'tool') { return { fill: '#E53935FF' } }
        else if (reason == 'fabric') { return { fill: '#005498FF' } }
        else if (reason == 'run') { return { fill: '#52c41aff' } }
        else { return { fill: '#00000000' } }
      },
      tooltip: false,
      statistic: false,
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };
}
export default Component;

/*

import { Column } from '@antv/g2plot';
import React, { useEffect, useState } from "react";
const data = [
  {
    name: 'London',
         month: 'Jan.',
         Month rainfall: 18.9,
  },
  {
    name: 'London',
         month: 'Feb.',
         Month rainfall: 28.8,
  },
  {
    name: 'London',
         month: 'Mar.',
         Month rainfall: 39.3,
  },
  {
    name: 'London',
         month: 'Apr.',
         Month rainfall: 81.4,
  },
  {
    name: 'London',
         month: 'May',
         Month rainfall: 47,
  },
  {
    name: 'London',
         month: 'Jun.',
         Month rainfall: 20.3,
  },
  {
    name: 'London',
         month: 'Jul.',
         Month rainfall: 24,
  },
  {
    name: 'London',
         month: 'Aug.',
         Month rainfall: 35.6,
  },
  {
    name: 'Berlin',
         month: 'Jan.',
         Month rainfall: 12.4,
  },
  {
    name: 'Berlin',
         month: 'Feb.',
         Month rainfall: 23.2,
  },
  {
    name: 'Berlin',
         month: 'Mar.',
         Month rainfall: 34.5,
  },
  {
    name: 'Berlin',
         month: 'Apr.',
         Month rainfall: 99.7,
  },
  {
    name: 'Berlin',
         month: 'May',
         Month rainfall: 52.6,
  },
  {
    name: 'Berlin',
         month: 'Jun.',
         Month rainfall: 35.5,
  },
  {
    name: 'Berlin',
         month: 'Jul.',
         Month rainfall: 37.4,
  },
  {
    name: 'Berlin',
         month: 'Aug.',
         Month rainfall: 42.4,
  },
];
const CompareChartsDemo = () => {
  useEffect(() => {
	const stackedColumnPlot = new Column('container', {
	  data,
	  isGroup: true,
	  xField: 'month',
	  yField: 'Month Rainfall',
	  seriesField: 'name',
	  / ** Set color * /
	  //color: ['#1ca9e6', '#f88c24'],
	  / ** Set spacing * /
	  // marginRatio: 0.1,
	  label: {
	    // Manually configure the Label data tag position
	    position: 'middle', // 'top', 'middle', 'bottom'
	    // Configurable additional layout method
	    layout: [
	      // Cylindrical map data tag position automatic adjustment
	      { type: 'interval-adjust-position' },
	      // Data label anti-blocking
	      { type: 'interval-hide-overlap' },
	      // Data label text color automatic adjustment
	      { type: 'adjust-color' },
	    ],
	  },
	});
	stackedColumnPlot.render();
	}, []);
  return <div id="container"></div>
};
export default CompareChartsDemo ;
*/



/*
import React, { useState, useEffect } from 'react';
	import { Column } from '@ant-design/charts';

	const DemoColumn: React.FC = () => {


	var data = [
	    {
	        name: 'London',
	         Month: 'Jan.',
	         Month rainfall: 18.9
	    },
	    {
	        name: 'London',
	         Month: 'Feb.',
	         Month rainfall: 28.8
	    },
	    {
	        name: 'London',
	         Month: 'Mar.',
	         Month rainfall: 39.3
	    },
	    {
	        name: 'London',
	         Month: 'Apr.',
	         Month rainfall: 81.4
	    },
	    {
	        name: 'London',
	         Month: 'May',
	         Month rainfall: 47
	    },
	    {
	        name: 'London',
	         Month: 'Jun.',
	         Month rainfall: 20.3
	    },
	    {
	        name: 'London',
	         Month: 'Jul.',
	         Month rainfall: 24
	    },
	    {
	        name: 'London',
	         Month: 'Aug.',
	         Month rainfall: 35.6
	    },
	    {
	        name: 'Berlin',
	         Month: 'Jan.',
	         Month rainfall: 12.4
	    },
	    {
	        name: 'Berlin',
	         Month: 'Feb.',
	         Month rainfall: 23.2
	    },
	    {
	        name: 'Berlin',
	         Month: 'Mar.',
	         Month rainfall: 34.5
	    },
	    {
	        name: 'Berlin',
	         Month: 'Apr.',
	         Month rainfall: 99.7
	    },
	    {
	        name: 'Berlin',
	         Month: 'May',
	         Month rainfall: 52.6
	    },
	    {
	        name: 'Berlin',
	         Month: 'Jun.',
	         Month rainfall: 35.5
	    },
	    {
	        name: 'Berlin',
	         Month: 'Jul.',
	         Month rainfall: 37.4
	    },
	    {
	        name: 'Berlin',
	         Month: 'Aug.',
	         Month rainfall: 42.4
	    }
	];
	var config = {
	    data: data,
	    isGroup: true,
	    xField: 'month',
	    yField: 'Month Rainfall',
	    seriesField: 'name',
	    label: {
	        position: 'middle',
	        layout: [
	            { type: 'interval-adjust-position' },
	            { type: 'interval-hide-overlap' },
	            { type: 'adjust-color' }
	        ]
	    }
	};
	  return <Column {...config} />;
	};

	export default DemoColumn;
*/

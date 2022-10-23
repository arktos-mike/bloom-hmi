import { Pie } from '@ant-design/plots';

const Component = (props: any) => {
  const config = {
    data: props.data,
    height:200,
    renderer: 'svg',
    appendPadding: 10,
    angleField: 'value',
    radius: 1, innerRadius: 0.1,
    colorField: 'reason',
    color: ['#52c41aFF', '#7339ABFF','#FF7F27FF','#FFB300FF','#E53935FF','#005498FF','#000000FF'],
    label: {
      type: '',
      offset: '-50%',
      style: {
        textAlign: 'center',
        fontSize: 0,
        content: ''
      }
    },
    statistic: { title: false, content: false },
    tooltip: false,
    legend: {
      layout: 'vertical',
      position: 'right',
      flipPage: false,
      label:{
        style: {
          fontSize: 0,
        }
      }
    }
  } as any;
  return (
    <Pie {...config} ></Pie>
  );
};

export default Component;





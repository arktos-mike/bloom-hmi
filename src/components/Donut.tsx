import { Pie } from '@ant-design/plots';

const Component = (props: any) => {
  const config = {
    data: props.data,
    renderer: 'svg',
    padding: 0,
    appendPadding: 5,
    angleField: 'value',
    radius: 1, innerRadius: 0.7,
    colorField: 'reason',
    color: props.colors,
    label: {
      offset: '-50%',
      style: {
        fontSize: 0,
      }
    },
    statistic: {
      title: false,
      content: {
        style: {
          fontSize:14,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: props.text,
      },
    },
    tooltip: false,
    legend: {
      layout: 'vertical',
      position: 'bottom-right',
      flipPage: false,
      offsetY: -50,
      offsetX: -50,
      maxWidth: 1,
      maxHeight: 1,
      selected: props.selected
    }
  } as any;
  return (
    <Pie {...config} ></Pie>
  );
};

export default Component;





import { Pie } from '@ant-design/plots';
import { memo } from 'react';
import { isEqual } from 'lodash-es';

const Component: React.FC<any> = memo(
  ({ data, selected, text }) => {

    const config = {
      data: data,
      renderer: 'svg',
      padding: 0,
      autofit: true,
      appendPadding: 5,
      angleField: 'value',
      radius: 1, innerRadius: 0.7,
      colorField: 'reason',
      color: (data: any) => {
        if (data['reason'] == 'run') return '#52c41aFF';
        else if (data['reason'] == 'button') return '#7339ABFF';
        else if (data['reason'] == 'fabric') return '#005498FF';
        else if (data['reason'] == 'tool') return '#E53935FF';
        else if (data['reason'] == 'weft') return '#FFB300FF';
        else if (data['reason'] == 'warp') return '#FF7F27FF';
        else if (data['reason'] == 'other') return '#000000FF';
        return '#00000000';
      },
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
            fontSize: 14,
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
          content: text,
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
        selected: selected
      },
      animation: false
    } as any;
    return (
      <Pie {...config} />
    );
  },
  (pre, next) => {
    return isEqual(pre?.data, next?.data);
  }
);

export default Component;





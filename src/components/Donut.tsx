import { Pie } from '@ant-design/plots';
import { memo } from 'react';
import { isEqual } from 'lodash-es';

const Component: React.FC<any> = memo(
  ({ data, selected, text, colors }) => {
    const config = {
      data: data,
      renderer: 'svg',
      padding: 0,
      appendPadding: 5,
      angleField: 'value',
      radius: 1, innerRadius: 0.7,
      colorField: 'reason',
      color: colors,
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
      }
    } as any;
    return (
      <Pie {...config} ></Pie>
    );
  },
  (pre, next) => {
    return isEqual(pre?.data, next?.data);
  }
);

export default Component;





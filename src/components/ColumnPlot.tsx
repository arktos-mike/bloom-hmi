import { Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';
dayjs.extend(duration);
import { useTranslation } from 'react-i18next';

const Component: React.FC<any> =
  ({ data }) => {
    const [ndata, setNdata] = useState([]);
    const { t, i18n } = useTranslation();
    useEffect(() => {
      setNdata(data.map(function (obj: any) {
        return { starttime: dayjs(obj.starttime).format('LL'), efficiency: obj.efficiency && Number(Number(obj.efficiency).toFixed(2)) };
      }));
    }, [data]);

    const config = {
      data: ndata,
      xField: 'starttime',
      yField: 'efficiency',
      xAxis: {
        label: {
          autoRotate: false,
        },
      },
      columnWidthRatio: 0.9,
      columnStyle: {
        radius: [10, 10, 0, 0],
      },
      label: {
        position: "top",
        offsetY: 8,
        style: {
          fill: '#000000',
          opacity: 0.6,
        }
      },
      slider: {
        height: 80,
        start: 0.0,
        end: 1.0,
      },
      meta: {
        starttime: {
          alias: t('report.date'),
        },
        efficiency: {
          alias: t('tags.efficiency.descr'),
        },
      },
    } as any;
    return (
      <Column {...config} />
    );
  }

export default Component;





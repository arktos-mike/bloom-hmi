import { Modal, notification, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { QuestionCircleOutlined, RedoOutlined, ExclamationCircleOutlined, DeleteOutlined, ScissorOutlined } from '@ant-design/icons';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button, RangePicker } from '@/components';
dayjs.extend(duration);

interface DataType {
  timestamp: any;
  event: number;
  meters: number;
}

type Props = {
  token: any;
};

const ClothLog: React.FC<Props> = ({
  token
}
) => {
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation();
  const [data, setData] = useState();
  const [period, setPeriod] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default', showSizeChanger: false
  });
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});


  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  };

  const modeCodeObj = (code: Number) => {
    let obj;
    if (code == 1) { obj = { color: '#000000FF', text: t('log.roll'), icon: <ScissorOutlined style={{ fontSize: '175%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (code == 0) { obj = { color: '#43A047FF', text: t('log.warpbeamchange'), icon: <RedoOutlined style={{ fontSize: '175%', color: '#43A047FF', paddingInline: 5 }} /> } }
     else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#00000000', paddingInline: 5 }} /> } }
    return obj;
  }
  const duration2text = (start: any, end: any) => {
    let diff = dayjs.duration(dayjs(end).diff(start))
    return (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
  }

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    pagination.total = currentDataSource.currentDataSource.length
    setPagination(pagination);
  };

  const handleDelete = async () => {
    try {
      if (!period) {
        openNotificationWithIcon('warning', t('notifications.dataerror'), 3, '', { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' });
      }
      else {
        const response = await fetch('http://localhost:3000/logs/clothlog/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period[0], end: period[1] }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        openNotificationWithIcon('success', t('notifications.logupdate'), 3, '', { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
        setPagination({ ...pagination, total: json.length });
        setData(json);
        setLoading(false);
      }
    }
    catch (error) { console.log(error) }
    fetchData();
  };
  const confirm = () => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: () => { handleDelete() },
    });
  };


  const columns: ColumnsType<DataType> = [
    {
      title: t('report.date'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => dayjs(a.timestamp.lower).unix() - dayjs(b.timestamp.lower).unix(),
      sortOrder: sortedInfo.columnKey === 'timestamp' ? sortedInfo.order : null,
      ellipsis: true,
      width: '20%',
      render: (_, record) => <>{dayjs(record.timestamp['lower']).format('LL LTS')}<br />{record.timestamp['upper'] ? dayjs(record.timestamp['upper']).format('LL LTS'):`‪‪ `}</>,
    },
    {
      title: t('log.event'),
      dataIndex: 'event',
      key: 'event',
      filters: [
        {
          text: <span>{modeCodeObj(0).icon} {modeCodeObj(0).text}</span>,
          value: 0,
        },
        {
          text: <span>{modeCodeObj(1).icon} {modeCodeObj(1).text}</span>,
          value: 1,
        },
      ],
      onFilter: (value, record) => record.event == value,
      ellipsis: true,
      render: (_, record) => <b>{modeCodeObj(record.event).icon} {' ' + modeCodeObj(record.event).text}</b>
    },
    {
      title: t('log.length'),
      dataIndex: 'meters',
      key: 'meters',
      sorter: (a, b) => a.meters - b.meters,
      sortOrder: sortedInfo.columnKey === 'meters' ? sortedInfo.order : null,
      ellipsis: true,
      width: '30%',
      render: (_, record) => record.meters && (Number(record?.meters).toFixed(2) + " " + t('tags.clothMeters.eng')),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/logs/clothlog', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('day'), end: period ? period[1] : dayjs() }),
      });
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({ ...pagination, total: json.length });
      setData(json);
      setLoading(false);
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
  }, [])

  useEffect(() => {
    if (typeof pagination.defaultPageSize == 'undefined') {
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height - 165) / 62) : 6, pageSize: height ? Math.floor((height - 165) / 62) : 6 })
    }
  }, [pagination])

  useEffect(() => {
    dayjs.locale(i18n.language)
    fetchData();
  }, [period]);

  return (
    <div ref={div} className='wrapper'>
      <div>
        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ margin: 10 }}>{t('log.select')}</h1>
          <RangePicker style={{ flexGrow: 1 }} defaultValue={[dayjs().subtract(7, 'days'), dayjs()]} onChange={(e: any) => { setPeriod([e ? e[0]?.startOf('minute') : dayjs().startOf('day'), e ? e[1]?.endOf('minute') : dayjs()]) }} />
          <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<DeleteOutlined />} size="large" type="primary" danger={true} style={{ margin: 10 }} onClick={confirm} ></Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          rowKey={record => JSON.stringify(record.timestamp)}
          size='small'
          style={{ width: '100%' }}
          onChange={handleChange}
          showSorterTooltip={false}
        />
      </div>
    </div>
  )
}

export default ClothLog

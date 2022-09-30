import { Modal, notification, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { ToolOutlined, QuestionCircleOutlined, SyncOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "../components/Icons"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button, DatePicker, RangePicker } from '@/components';
dayjs.extend(duration);

interface DataType {
  stime: any;
  etime: any;
  picks: number;
  clothmeters: number;
  speedrpm: number;
  speedmph: number;
  loomefficiency: number;
  startattempts: number;
  runtimedur: any;
  descrstops: any;
}

type Props = {
  token: any;
};

const MonthReport: React.FC<Props> = ({
  token
}
) => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState();
  const [period, setPeriod] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultPageSize: 8, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default', showSizeChanger: false
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

  const duration2text = (start: any) => {
    let diff = dayjs.duration(dayjs().diff(start))
    return (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
  }

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    pagination.total = currentDataSource.currentDataSource.length
    setPagination(pagination);
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
      onOk: () => {  },
    });
  };


  const columns: ColumnsType<DataType> = [
    {
      title: t('reports.date'),
      dataIndex: 'stime',
      key: 'stime',
      ellipsis: true,
      width: '10%',
      render: (_, record) => dayjs(record.stime).format('LL')
    },
    {
      title: t('tags.picks.descr'),
      dataIndex: 'picks',
      key: 'picks',
      sorter: (a, b) => a.picks - b.picks,
      sortOrder: sortedInfo.columnKey === 'picks' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record.picks}</b>,
    },
    {
      title: t('reports.meters'),
      dataIndex: 'clothmeters',
      key: 'clothmeters',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.clothmeters?.toFixed(2)
    },
    {
      title: t('reports.rpm'),
      dataIndex: 'speedrpm',
      key: 'speedrpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.speedrpm?.toFixed(1)
    },
    {
      title: t('reports.mph'),
      dataIndex: 'speedmph',
      key: 'speedmph',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.speedmph?.toFixed(2)
    },
    {
      title: t('reports.efficiency'),
      dataIndex: 'loomefficiency',
      key: 'loomefficiency',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.loomefficiency?.toFixed(2)
    },
    {
      title: t('reports.starts'),
      dataIndex: 'startattempts',
      key: 'startattempts',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record.startattempts
    },
    {
      title: t('shift.duration'),
      dataIndex: 'runtimedur',
      key: 'runtimedur',
      //sorter: (a, b) => dayjs.duration(dayjs(a.timestamp.upper).diff(a.timestamp.lower)).asMilliseconds() - dayjs.duration(dayjs(b.timestamp.upper).diff(b.timestamp.lower)).asMilliseconds(),
      //sortOrder: sortedInfo.columnKey === 'duration' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => duration2text(record.runtimedur),
    },
    {
      title: t('reports.stops'),
      dataIndex: 'descrstops',
      key: 'descrstops',
      ellipsis: true,
      render: (_, record) => record?.descrstops[0].toString(),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/reports/monthreport', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
      });
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({
        total: json.length,
        defaultPageSize: 8, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default', showSizeChanger: false
      });
      setData(json);
      setLoading(false);
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    dayjs.locale(i18n.language)
    fetchData();
  }, [period]);

  return (
    <div>
      <div>
        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ margin: 10 }}>{t('log.select')}</h1>
              <DatePicker style={{ flexGrow: 1 }} picker="month" format='MMMM YYYY' defaultValue={dayjs().month()} onChange={(e: any) => { setPeriod([e ? e?.startOf('month') : dayjs().startOf('month'), e ? e?.endOf('month') : dayjs()]) }} />
              <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<DeleteOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={confirm} ></Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          rowKey={() => Math.random()}
          size='small'
          style={{ width: '100%' }}
          onChange={handleChange}
          showSorterTooltip={false}
        />
      </div>
    </div>
  )
}

export default MonthReport

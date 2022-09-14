import { notification, Table} from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { ToolOutlined, QuestionCircleOutlined, SyncOutlined, LoadingOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "../components/Icons"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

interface DataType {
  modecode: number;
  picks: number;
  timestamp: any;
}

type Props = {
  };

const ModeLog: React.FC<Props> = ({
}
) => {
  const { t } = useTranslation();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultPageSize: 10, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default', showSizeChanger: false
  });
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const modeCodeObj = (code: Number) => {
    let obj;
    if (code == 0) { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (code == 1) { obj = { color: '#43A047FF', text: t('tags.mode.run'), icon: <SyncOutlined style={{ fontSize: '175%', color: '#43A047FF',paddingInline: 5 }} /> } }
    else if (code == 2) { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '175%', color: '#7339ABFF',paddingInline: 5 }} /> } }
    else if (code == 3) { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '175%', color: '#FF7F27FF',paddingInline: 5 }} /> } }
    else if (code == 4) { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '175%', color: '#FFB300FF',paddingInline: 5 }} /> } }
    else if (code == 5) { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '175%', color: '#E53935FF',paddingInline: 5 }} /> } }
    else if (code == 6) { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '175%', color: '#005498FF',paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#00000000',paddingInline: 5 }} /> } }
    return obj;
  }
  const duration2text = (start: any, end: any) => {
    let diff = dayjs.duration(dayjs(end).diff(start))
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }
  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    pagination.total = currentDataSource.currentDataSource.length
    setPagination(pagination);
  };

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

  const columns: ColumnsType<DataType> = [
    {
      title: t('log.event'),
      dataIndex: 'modecode',
      key: 'modecode',
      sorter: (a, b) => a.modecode - b.modecode,
      sortOrder: sortedInfo.columnKey === 'modecode' ? sortedInfo.order : null,
      ellipsis: true,
      width: '50%',
      render: (_, record) => <b>{modeCodeObj(record.modecode).icon} { ' ' + modeCodeObj(record.modecode).text}</b>
    },
    {
      title: t('tags.picks.eng'),
      dataIndex: 'picks',
      key: 'picks',
      sorter: (a, b) => a.picks - b.picks,
      sortOrder: sortedInfo.columnKey === 'picks' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record.picks}</b>,
    },
    {
      title: t('shift.duration'),
      dataIndex: 'timestamp',
      key: 'duration',
      sorter: (a, b) => dayjs.duration(dayjs(a.timestamp.upper).diff(a.timestamp.lower)).asMilliseconds() - dayjs.duration(dayjs(b.timestamp.upper).diff(b.timestamp.lower)).asMilliseconds(),
      sortOrder: sortedInfo.columnKey === 'duration' ? sortedInfo.order : null,
      ellipsis: true,
      width: '20%',
      render: (_, record) => (duration2text(record.timestamp['lower'],record.timestamp['upper'])),
    },
    {
      title: t('shift.starttime'),
      dataIndex: 'timestamp',
      key: 'start',
      sorter: (a, b) => dayjs(a.timestamp.lower).unix() - dayjs(b.timestamp.lower).unix(),
      sortOrder: sortedInfo.columnKey === 'start' ? sortedInfo.order : null,
      ellipsis: true,
      render: (_, record) => (dayjs(record.timestamp['lower']).format('LL LTS')),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/logs/startstops');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({
        total: json.length,
        defaultPageSize: 10, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default', showSizeChanger: false
      });
      setData(json);
      setLoading(false);

    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          size='small'
          style={{ width: '100%' }}
          onChange={handleChange}
          showSorterTooltip={false}
        />
      </div>
    </div>
  )
}

export default ModeLog

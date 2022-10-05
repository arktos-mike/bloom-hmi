import { Modal, notification, Table, Badge, Space } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { MinusCircleTwoTone, PlusCircleTwoTone, ToolOutlined, QuestionCircleOutlined, SyncOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [total, setTotal] = useState();
  const [period, setPeriod] = useState([dayjs().startOf('month'), dayjs()]);
  const [loading, setLoading] = useState(false);
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

  const stopObj = (reason: string) => {
    let obj;
    if (reason == 'other') { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '175%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '175%', color: '#FF7F27FF', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '175%', color: '#FFB300FF', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '175%', color: '#E53935FF', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '175%', color: '#005498FF', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#00000000', paddingInline: 5 }} /> } }
    return obj;
  }

  const duration2text = (diff: any) => {
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopsAgg = (stops: any) => {
    let dur = dayjs.duration(0)
    let total = 0
    stops.map((part: any) => {
      dur = dur.add(part[Object.keys(part)[0]].dur)
      total = total + part[Object.keys(part)[0]].total
    })
    return Object.assign({ dur: dur, total: total })
  }

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
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
      onOk: () => { },
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
      render: (_, record) => record.picks,
    },
    {
      title: t('reports.meters'),
      dataIndex: 'clothmeters',
      key: 'clothmeters',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.clothmeters && (Number(record?.clothmeters).toFixed(2) + " " + t(''))
    },
    {
      title: t('reports.rpm'),
      dataIndex: 'speedrpm',
      key: 'speedrpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.speedrpm && (Number(record?.speedrpm).toFixed(1) + " " + t(''))
    },
    {
      title: t('reports.mph'),
      dataIndex: 'speedmph',
      key: 'speedmph',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.speedmph && (Number(record?.speedmph).toFixed(2) + " " + t(''))
    },
    {
      title: t('reports.efficiency'),
      dataIndex: 'loomefficiency',
      key: 'loomefficiency',
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record?.loomefficiency && (Number(record?.loomefficiency).toFixed(2) + " %")}</b>
    },
    {
      title: t('reports.starts'),
      dataIndex: 'startattempts',
      key: 'startattempts',
      ellipsis: true,
      width: '10%',
      render: (_, record) => <div><Badge
        count={record.startattempts} overflowCount={999}
        style={{ backgroundColor: '#52c41a' }}
      /> {record?.runtimedur && duration2text(dayjs.duration(record?.runtimedur))}</div>
    },
    Table.EXPAND_COLUMN,
    {
      title: t('reports.stops'),
      dataIndex: 'descrstops',
      key: 'descrstops',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={stopsAgg(record?.descrstops).total} overflowCount={999}
        style={{ backgroundColor: '#1890ff' }}
      /> {duration2text(stopsAgg(record?.descrstops).dur)}</div>
    },
  ];

  const fetchStatInfo = async () => {
    try {
      if (period[0] && period[1]) {
        setLoading(true);
        const response = await fetch('http://localhost:3000/shifts/getstatinfo', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setTotal(json);
        setLoading(false);
      }
    }
    catch (error) { console.log(error); }
  };

  const fetchData = async () => {
    try {
      if (period[0] && period[1]) {
        setLoading(true);
        const response = await fetch('http://localhost:3000/reports/monthreport', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setData(json);
        setLoading(false);
      }
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    dayjs.locale(i18n.language)
    fetchStatInfo();
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
          pagination={false}
          scroll={{ x: '100%', y: 330 }}
          expandable={{
            expandedRowRender: record => <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
              {record?.descrstops.map((stop: any) => (
                stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                  count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                  style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
              }
            </Space>,
            rowExpandable: record => stopsAgg(record?.descrstops).total > 0,
            expandIcon: ({ expanded, onExpand, record }) =>
              stopsAgg(record?.descrstops).total == 0 ? null : expanded ? (
                <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              ) : (
                <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              )
          }}
          loading={loading}
          rowKey={record => JSON.stringify(record.stime)}
          size='small'
          onChange={handleChange}
          showSorterTooltip={false}
          summary=
          {() => {
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}><b>{period[0] && dayjs(period[0]).format('MMMM YYYY')}</b></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {total && total[0]['sumpicks']}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {total && Number(total[0]['meters']).toFixed(2) + " " + t('')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {total && Number(total[0]['rpm']).toFixed(1) + " " + t('')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {total && Number(total[0]['mph']).toFixed(2) + " " + t('')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <b>{total && Number(total[0]['efficiency']).toFixed(2) + " %"}</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <Badge
                      count={total && total[0]['starts']} overflowCount={999}
                      style={{ backgroundColor: '#52c41a' }}
                    /> {total && duration2text(dayjs.duration(total[0]['runtime'] ? total[0]['runtime'] : 0))}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} colSpan={2}>
                    <Badge
                      count={total && stopsAgg(total[0]['stops']).total} overflowCount={999}
                      style={{ backgroundColor: '#1890ff' }}
                    /> {total && duration2text(stopsAgg(total[0]['stops']).dur)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={24}><Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
                    {total && (total[0]['stops'] as []).map((stop: any) => (
                      stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                        count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                        style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                      />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                    }
                  </Space></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </div>
    </div>
  )
}

export default MonthReport

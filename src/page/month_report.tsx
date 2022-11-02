import { Modal, notification, Table, Badge, Space, Tabs } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { ScheduleOutlined, ReconciliationOutlined, TeamOutlined, MinusCircleTwoTone, PlusCircleTwoTone, ToolOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "../components/Icons"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button, ColumnPlot, DatePicker, RangePicker } from '@/components';
dayjs.extend(duration);

interface DataType {
  starttime: any;
  endtime: any;
  picks: number;
  meters: number;
  rpm: number;
  mph: number;
  efficiency: number;
  starts: number;
  runtime: any;
  stops: any;
}

interface UserDataType {
  userid: any;
  workdur: any;
  picks: number;
  meters: number;
  rpm: number;
  mph: number;
  efficiency: number;
  starts: number;
  runtime: any;
  stops: any;
}

interface ShiftDataType {
  shiftname: any;
  starttime: any;
  endtime: any;
  picks: number;
  meters: number;
  rpm: number;
  mph: number;
  efficiency: number;
  starts: number;
  runtime: any;
  stops: any;
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
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState();
  const [shiftData, setShiftData] = useState();
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);

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
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopsAgg = (stops: any) => {
    let dur = dayjs.duration(0)
    let total = 0
    stops.map((part: any) => {
      if (part[Object.keys(part)[0]].dur != null) {
        dur = dur.add(part[Object.keys(part)[0]].dur)
        total = total + part[Object.keys(part)[0]].total
      }
    })
    return Object.assign({ dur: dur, total: total })
  }

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
  };

  const handleUserChange: TableProps<UserDataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
  };

  const handleShiftChange: TableProps<ShiftDataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
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

  const shiftColumns: ColumnsType<ShiftDataType> = [
    {
      title: t('shift.shift'),
      dataIndex: 'shiftname',
      key: 'shiftname',
      ellipsis: true,
      width: '16%',
      render: (_, record) => <><b>{t('shift.shift') + ' ' + record.shiftname}</b><br />{dayjs(record.starttime).format('L LTS')}<br />{dayjs(record.endtime).format('L LTS')}</>
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
      title: t('tags.clothMeters.descr'),
      dataIndex: 'meters',
      key: 'meters',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.meters && (Number(record?.meters).toFixed(2) + " " + t('tags.clothMeters.eng'))
    },
    {
      title: t('tags.speedMainDrive.descr'),
      dataIndex: 'rpm',
      key: 'rpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.rpm && (Number(record?.rpm).toFixed(1) + " " + t('tags.speedMainDrive.eng'))
    },
    {
      title: t('tags.speedCloth.descr'),
      dataIndex: 'mph',
      key: 'mph',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.mph && (Number(record?.mph).toFixed(2) + " " + t('tags.speedCloth.eng'))
    },
    {
      title: t('tags.efficiency.descr'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      sorter: (a, b) => Number(a.efficiency) - Number(b.efficiency),
      sortOrder: sortedInfo.columnKey === 'efficiency' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record?.efficiency && (Number(record?.efficiency).toFixed(2) + " %")}</b>
    },
    {
      title: t('report.starts'),
      dataIndex: 'starts',
      key: 'starts',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={record.starts} overflowCount={999}
        style={{ backgroundColor: '#52c41a' }}
      /> {record?.runtime && duration2text(dayjs.duration(record?.runtime))}</div>
    },
    Table.EXPAND_COLUMN,
    {
      title: t('report.stops'),
      dataIndex: 'stops',
      key: 'stops',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={stopsAgg(record?.stops).total} overflowCount={999}
        style={{ backgroundColor: '#1890ff' }}
      /> {duration2text(stopsAgg(record?.stops).dur)}</div>
    },
  ];

  const userColumns: ColumnsType<UserDataType> = [
    {
      title: t('user.weaver'),
      dataIndex: 'userid',
      key: 'userid',
      ellipsis: true,
      width: '16%',
      render: (_, record) => <><b>{(users?.filter((item: any) => item.id == record.userid))[0]['name']}</b><br />{period[0] && dayjs(period[0]).format('MMMM YYYY')}<br />{duration2text(dayjs.duration(record.workdur))}</>
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
      title: t('tags.clothMeters.descr'),
      dataIndex: 'meters',
      key: 'meters',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.meters && (Number(record?.meters).toFixed(2) + " " + t('tags.clothMeters.eng'))
    },
    {
      title: t('tags.speedMainDrive.descr'),
      dataIndex: 'rpm',
      key: 'rpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.rpm && (Number(record?.rpm).toFixed(1) + " " + t('tags.speedMainDrive.eng'))
    },
    {
      title: t('tags.speedCloth.descr'),
      dataIndex: 'mph',
      key: 'mph',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.mph && (Number(record?.mph).toFixed(2) + " " + t('tags.speedCloth.eng'))
    },
    {
      title: t('tags.efficiency.descr'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      sorter: (a, b) => Number(a.efficiency) - Number(b.efficiency),
      sortOrder: sortedInfo.columnKey === 'efficiency' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record?.efficiency && (Number(record?.efficiency).toFixed(2) + " %")}</b>
    },
    {
      title: t('report.starts'),
      dataIndex: 'starts',
      key: 'starts',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={record.starts} overflowCount={999}
        style={{ backgroundColor: '#52c41a' }}
      /> {record?.runtime && duration2text(dayjs.duration(record?.runtime))}</div>
    },
    Table.EXPAND_COLUMN,
    {
      title: t('report.stops'),
      dataIndex: 'stops',
      key: 'stops',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={stopsAgg(record?.stops).total} overflowCount={999}
        style={{ backgroundColor: '#1890ff' }}
      /> {duration2text(stopsAgg(record?.stops).dur)}</div>
    },
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: t('report.date'),
      dataIndex: 'starttime',
      key: 'starttime',
      ellipsis: true,
      width: '16%',
      render: (_, record) => dayjs(record.starttime).format('LL')
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
      title: t('tags.clothMeters.descr'),
      dataIndex: 'meters',
      key: 'meters',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.meters && (Number(record?.meters).toFixed(2) + " " + t('tags.clothMeters.eng'))
    },
    {
      title: t('tags.speedMainDrive.descr'),
      dataIndex: 'rpm',
      key: 'rpm',
      ellipsis: true,
      width: '10%',
      render: (_, record) => record?.rpm && (Number(record?.rpm).toFixed(1) + " " + t('tags.speedMainDrive.eng'))
    },
    {
      title: t('tags.speedCloth.descr'),
      dataIndex: 'mph',
      key: 'mph',
      ellipsis: true,
      width: '8%',
      render: (_, record) => record?.mph && (Number(record?.mph).toFixed(2) + " " + t('tags.speedCloth.eng'))
    },
    {
      title: t('tags.efficiency.descr'),
      dataIndex: 'efficiency',
      key: 'efficiency',
      sorter: (a, b) => Number(a.efficiency) - Number(b.efficiency),
      sortOrder: sortedInfo.columnKey === 'efficiency' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
      render: (_, record) => <b>{record?.efficiency && (Number(record?.efficiency).toFixed(2) + " %")}</b>
    },
    {
      title: t('report.starts'),
      dataIndex: 'starts',
      key: 'starts',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={record.starts} overflowCount={999}
        style={{ backgroundColor: '#52c41a' }}
      /> {record?.runtime && duration2text(dayjs.duration(record?.runtime))}</div>
    },
    Table.EXPAND_COLUMN,
    {
      title: t('report.stops'),
      dataIndex: 'stops',
      key: 'stops',
      ellipsis: true,
      render: (_, record) => <div><Badge
        count={stopsAgg(record?.stops).total} overflowCount={999}
        style={{ backgroundColor: '#1890ff' }}
      /> {duration2text(stopsAgg(record?.stops).dur)}</div>
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
      }
    }
    catch (error) { console.log(error); }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/weavers');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setUsers(json);
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
      }
    }
    catch (error) { console.log(error); }
  };

  const fetchUserData = async () => {
    try {
      if (period[0] && period[1]) {
        setLoading(true);
        const response = await fetch('http://localhost:3000/reports/usersreport', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setUserData(json);
      }
    }
    catch (error) { console.log(error); }
  };

  const fetchShiftData = async () => {
    try {
      if (period[0] && period[1]) {
        setLoading(true);
        const response = await fetch('http://localhost:3000/reports/shiftsreport', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        const json = await response.json();
        setShiftData(json);
        setLoading(false);
      }
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    fetchUsers();
  }, []);

  useEffect(()=>{
    dayjs.locale(i18n.language)
  }, [i18n.language])

  useEffect(() => {
    fetchStatInfo();
    fetchData();
    fetchUserData();
    fetchShiftData();
  }, [period]);

  const items = [
    {
      label: <><ReconciliationOutlined />{t('panel.loom')}</>, key: 'loom', children:
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: '100%', y: height ? height - 257 : 0 }}
          expandable={{
            expandedRowRender: record => <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
              {record?.stops.map((stop: any) => (
                stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                  count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                  style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
              }
            </Space>,
            rowExpandable: record => stopsAgg(record?.stops).total > 0,
            expandIcon: ({ expanded, onExpand, record }) =>
              stopsAgg(record?.stops).total == 0 ? null : expanded ? (
                <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              ) : (
                <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              )
          }}
          loading={loading}
          rowKey={record => JSON.stringify(record.starttime)}
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
                    {total && total[0] && total[0]['picks']}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {total && total[0] && total[0]['meters'] && Number(total[0]['meters']).toFixed(2) + " " + t('tags.clothMeters.eng')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {total && total[0] && total[0]['rpm'] && Number(total[0]['rpm']).toFixed(1) + " " + t('tags.speedMainDrive.eng')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {total && total[0] && total[0]['mph'] && Number(total[0]['mph']).toFixed(2) + " " + t('tags.speedCloth.eng')}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <b>{total && total[0] && total[0]['efficiency'] && Number(total[0]['efficiency']).toFixed(2) + " %"}</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <Badge
                      count={total && total[0] && total[0]['starts']} overflowCount={999}
                      style={{ backgroundColor: '#52c41a' }}
                    /> {total && total[0] && duration2text(dayjs.duration(total[0]['runtime'] ? total[0]['runtime'] : 0))}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} colSpan={2}>
                    <Badge
                      count={total && total[0] && stopsAgg(total[0]['stops']).total} overflowCount={999}
                      style={{ backgroundColor: '#1890ff' }}
                    /> {total && total[0] && duration2text(stopsAgg(total[0]['stops']).dur)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={24}><Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
                    {total && total[0] && (total[0]['stops'] as []).map((stop: any) => (
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
    },
    {
      label: <><TeamOutlined />{t('panel.weavers')}</>, key: 'weavers', children:
        <Table
          columns={userColumns}
          dataSource={userData}
          pagination={false}
          scroll={{ x: '100%', y: height ? height - 175 : 0 }}
          expandable={{
            expandedRowRender: record => <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
              {record?.stops.map((stop: any) => (
                stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                  count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                  style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
              }
            </Space>,
            rowExpandable: record => stopsAgg(record?.stops).total > 0,
            expandIcon: ({ expanded, onExpand, record }) =>
              stopsAgg(record?.stops).total == 0 ? null : expanded ? (
                <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              ) : (
                <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              )
          }}
          loading={loading}
          rowKey={record => JSON.stringify(record.userid)}
          size='small'
          onChange={handleUserChange}
          showSorterTooltip={false}
        />
    },
    {
      label: <><ScheduleOutlined />{t('panel.shifts')}</>, key: 'shifts', children:
        <Table
          columns={shiftColumns}
          dataSource={shiftData}
          pagination={false}
          scroll={{ x: '100%', y: height ? height - 175 : 0 }}
          expandable={{
            expandedRowRender: record => <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-evenly' }}>
              {record?.stops.map((stop: any) => (
                stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge
                  count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                  style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color, marginRight: '3px' }}
                />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
              }
            </Space>,
            rowExpandable: record => stopsAgg(record?.stops).total > 0,
            expandIcon: ({ expanded, onExpand, record }) =>
              stopsAgg(record?.stops).total == 0 ? null : expanded ? (
                <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              ) : (
                <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
              )
          }}
          loading={loading}
          rowKey={record => JSON.stringify(record.starttime)}
          size='small'
          onChange={handleShiftChange}
          showSorterTooltip={false}
        />
    },
    {
      label: <><BarChartOutlined />{t('tags.efficiency.descr')}</>, key: 'graph', children:
        <ColumnPlot data={data} />
    },
  ];
  return (
    <div ref={div} className='wrapper'>
      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ margin: 10 }}>{t('log.select')}</h1>
        <DatePicker style={{ flexGrow: 1 }} picker="month" format='MMMM YYYY' defaultValue={dayjs()} onChange={(e: any) => { setPeriod([e ? e?.startOf('month') : dayjs().startOf('month'), e ? e?.endOf('month') : dayjs()]) }} />
        {false && <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<DeleteOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={confirm} ></Button>}
      </div>
      <Tabs size='small' type='card' animated={{ inkBar: true, tabPane: true }} items={items} />
    </div>
  )
}

export default MonthReport

import { Modal, Table, Badge, Space } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { MinusCircleTwoTone, PlusCircleTwoTone, ToolOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "../components/Icons"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { memo, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import duration from 'dayjs/plugin/duration';
import { Button, DatePicker, Select } from '@/components';
import { isEqual } from 'lodash';
import * as ExcelJs from 'exceljs';
import { saveWorkbook } from "./utils";
import { addTitle, adjustColumnWidth } from './utils/excelUtils';
import { notification } from 'antd'
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

type Props = {
  token: any;
  decypher: any;
  shadowUser: any;
  usb: any;
  lifetime: any;
};

const UserReport: React.FC<Props> = memo(({
  token,
  decypher,
  shadowUser,
  usb,
  lifetime
}
) => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState();
  const [users, setUsers] = useState();
  const [total, setTotal] = useState();
  const [user, setUser] = useState(token && decypher && decypher?.role == 'weaver' ? decypher?.id : Number(shadowUser?.id));
  const [period, setPeriod] = useState([dayjs().startOf('month'), dayjs()]);
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);

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
    let durstr = (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
    if (durstr == "") durstr = "<1 " + t('shift.secs')
    return durstr
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

  const saveReport = async () => {
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(t('panel.weavers'));
    worksheet.properties.defaultRowHeight = 20;
    worksheet.columns =
      [
        { header: t('report.date'), key: 'starttime', },
        { header: t('tags.picks.descr'), key: 'picks', },
        { header: t('tags.clothMeters.descr') + ", " + t('tags.clothMeters.eng'), key: 'meters', },
        { header: t('tags.speedMainDrive.descr') + ", " + t('tags.speedMainDrive.eng'), key: 'rpm', },
        { header: t('tags.speedCloth.descr') + ", " + t('tags.speedCloth.eng'), key: 'mph', },
        { header: t('tags.efficiency.descr') + ", %", key: 'efficiency', },
        { header: t('report.starts'), key: 'starts', },
        { header: t('report.starts') + ", " + t('shift.hours'), key: 'startsh', },
        { header: t('report.stops'), key: 'stops', },
        { header: t('report.stops') + ", " + t('shift.hours'), key: 'stopsh', },
        { header: t('stop.button'), key: 'stopsb', },
        { header: t('stop.button') + ", " + t('shift.hours'), key: 'stopsbh', },
        { header: t('stop.warp'), key: 'stopswa', },
        { header: t('stop.warp') + ", " + t('shift.hours'), key: 'stopswah', },
        { header: t('stop.weft'), key: 'stopswe', },
        { header: t('stop.weft') + ", " + t('shift.hours'), key: 'stopsweh', },
        { header: t('stop.tool'), key: 'stopst', },
        { header: t('stop.tool') + ", " + t('shift.hours'), key: 'stopsth', },
        { header: t('stop.fabric'), key: 'stopsf', },
        { header: t('stop.fabric') + ", " + t('shift.hours'), key: 'stopsfh', },
        { header: t('stop.other'), key: 'stopso', },
        { header: t('stop.other') + ", " + t('shift.hours'), key: 'stopsoh', },
      ];
    worksheet.duplicateRow(1, 4, true);
    addTitle(worksheet, t('menu.userReport') + ' ' + lifetime?.type + ' (' + lifetime?.serialno + '）', ((users || []).filter((item: any) => item.id == Number(user)))[0]['name'] + ' - ' + dayjs(period[0]).format('MMMM YYYY'))
    worksheet.getRow(5).font = { name: 'PTSans', family: 4, size: 9, bold: true }
    worksheet.getRow(5).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFececec' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRows((data || []).map((record: any) => ({
      ...record,
      starttime: dayjs(record.starttime).format('L LTS') + ' - ' + dayjs(record.endtime).format('L LTS'),
      picks: record?.picks && (Number(record?.picks)),
      meters: record?.meters && (Number(Number(record?.meters).toFixed(2))),
      rpm: record?.rpm && (Number(Number(record?.rpm).toFixed(1))),
      mph: record?.mph && (Number(Number(record?.mph).toFixed(2))),
      efficiency: record?.efficiency && (Number(Number(record?.efficiency).toFixed(2))),
      starts: record?.runtime && (Number(record?.starts)),
      startsh: record?.runtime && (Number(dayjs.duration(record?.runtime).asHours().toFixed(1))),
      stops: record?.stops && (Number(stopsAgg(record?.stops).total)),
      stopsh: record?.stops && (Number(stopsAgg(record?.stops).dur.asHours().toFixed(1))),
      stopsb: record?.stops.filter((stop: any) => stop?.button?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.button?.total)[0]?.button.total)),
      stopsbh: record?.stops.filter((stop: any) => stop?.button?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.button?.total))[0]?.button.dur).asHours().toFixed(1))),
      stopswa: record?.stops.filter((stop: any) => stop?.warp?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.warp?.total)[0]?.warp.total)),
      stopswah: record?.stops.filter((stop: any) => stop?.warp?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.warp?.total))[0]?.warp.dur).asHours().toFixed(1))),
      stopswe: record?.stops.filter((stop: any) => stop?.weft?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.weft?.total)[0]?.weft.total)),
      stopsweh: record?.stops.filter((stop: any) => stop?.weft?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.weft?.total))[0]?.weft.dur).asHours().toFixed(1))),
      stopst: record?.stops.filter((stop: any) => stop?.tool?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.tool?.total)[0]?.tool.total)),
      stopsth: record?.stops.filter((stop: any) => stop?.tool?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.tool?.total))[0]?.tool.dur).asHours().toFixed(1))),
      stopsf: record?.stops.filter((stop: any) => stop?.fabric?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.fabric?.total)[0]?.fabric.total)),
      stopsfh: record?.stops.filter((stop: any) => stop?.fabric?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.fabric?.total))[0]?.fabric.dur).asHours().toFixed(1))),
      stopso: record?.stops.filter((stop: any) => stop?.other?.total)[0] && (Number(record?.stops.filter((stop: any) => stop?.other?.total)[0]?.other.total)),
      stopsoh: record?.stops.filter((stop: any) => stop?.other?.total)[0] && (Number(dayjs.duration((record?.stops.filter((stop: any) => stop?.other?.total))[0]?.other.dur).asHours().toFixed(1)))
    })));
    worksheet.addRow({
      starttime: period[0] && dayjs(period[0]).format('MMMM YYYY') + ' - ' + (total && total[0] && duration2text(dayjs.duration(total[0]['workdur']))),
      picks: total && total[0] && total[0]['picks'] && (Number(total && total[0] && total[0]['picks'])),
      meters: total && total[0] && total[0]['meters'] && (Number(Number(total && total[0] && total[0]['meters']).toFixed(2))),
      rpm: total && total[0] && total[0]['rpm'] && (Number(Number(total && total[0] && total[0]['rpm']).toFixed(1))),
      mph: total && total[0] && total[0]['mph'] && (Number(Number(total && total[0] && total[0]['mph']).toFixed(2))),
      efficiency: total && total[0] && total[0]['efficiency'] && (Number(Number(total && total[0] && total[0]['efficiency']).toFixed(2))),
      starts: total && total[0] && total[0]['runtime'] && (Number(total && total[0] && total[0]['starts'])),
      startsh: total && total[0] && total[0]['runtime'] && (Number(dayjs.duration(total && total[0] && total[0]['runtime']).asHours().toFixed(1))),
      stops: total && total[0] && total[0]['stops'] && (Number(stopsAgg(total && total[0] && total[0]['stops']).total)),
      stopsh: total && total[0] && total[0]['stops'] && (Number(stopsAgg(total && total[0] && total[0]['stops']).dur.asHours().toFixed(1))),
      stopsb: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.button?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.button?.total)[0]['button']['total'])),
      stopsbh: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.button?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.button?.total))[0]['button']['dur']).asHours().toFixed(1))),
      stopswa: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.warp?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.warp?.total)[0]['warp']['total'])),
      stopswah: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.warp?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.warp?.total))[0]['warp']['dur']).asHours().toFixed(1))),
      stopswe: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.weft?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.weft?.total)[0]['weft']['total'])),
      stopsweh: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.weft?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.weft?.total))[0]['weft']['dur']).asHours().toFixed(1))),
      stopst: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.tool?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.tool?.total)[0]['tool']['total'])),
      stopsth: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.tool?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.tool?.total))[0]['tool']['dur']).asHours().toFixed(1))),
      stopsf: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.fabric?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.fabric?.total)[0]['fabric']['total'])),
      stopsfh: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.fabric?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.fabric?.total))[0]['fabric']['dur']).asHours().toFixed(1))),
      stopso: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.other?.total)[0] && (Number(total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.other?.total)[0]['other']['total'])),
      stopsoh: total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.other?.total)[0] && (Number(dayjs.duration((total && total[0] && (total[0]['stops'] as []).filter((stop: any) => stop?.other?.total))[0]['other']['dur']).asHours().toFixed(1)))
    });
    worksheet.getRow(6 + (data || []).length).font = { name: 'PTSans', family: 4, size: 11, bold: true }
    adjustColumnWidth(worksheet);
    for (let rowNum = 6; rowNum <= 6 + (data || []).length; rowNum++) {
      const row = worksheet.getRow(rowNum);
      row.height = 20;
    }
    const json = await saveWorkbook(workbook, t('menu.userReport') + '_' + lifetime?.type + '_(' + lifetime?.serialno + ')_' + ((users || []).filter((item: any) => item.id == Number(user)))[0]['name'] + '_' + dayjs(period[0]).format('MMMM YYYY') + '.xlsx');
    openNotificationWithIcon((json?.error || json == null) ? 'warning' : 'success', t(json?.message || 'notifications.servererror'), 3, '', (json?.error || json == null) ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: t('report.date'),
      dataIndex: 'starttime',
      key: 'starttime',
      ellipsis: true,
      width: '16%',
      render: (_, record) => <>{dayjs(record.starttime).format('L LTS')}<br />{dayjs(record.endtime).format('L LTS')}</>
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
      if (user && period[0] && period[1]) {
        setLoading(true);
        const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/shifts/getuserstatinfo', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ id: user, start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
        const json = await response.json();
        setTotal(json);
      }
    }
    catch (error) { /*console.log(error);*/ }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/users/weavers');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setUsers(json);
    }
    catch (error) { /*console.log(error);*/ }
  };

  const fetchData = async () => {
    try {
      if (user && period[0] && period[1]) {
        setLoading(true);
        const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/reports/userreport', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ id: user, start: period ? period[0] : dayjs().startOf('month'), end: period ? period[1] : dayjs() }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
        const json = await response.json();
        setData(json);
        setLoading(false);
      }
    }
    catch (error) { /*console.log(error);*/ }
  };

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    return () => { }
  }, []);

  useEffect(() => {
    dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
    return () => { }
  }, [i18n.language])

  useEffect(() => {
    fetchUsers();
    return () => { }
  }, [token]);

  useEffect(() => {
    shadowUser?.id && setUser(Number(shadowUser?.id));
    return () => { }
  }, [shadowUser]);

  useEffect(() => {
    fetchStatInfo();
    fetchData();
    return () => { }
  }, [period, user]);

  return (
    <div ref={div} className='wrapper'>
      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 10 }}>{t('user.weaver')}</h1>
        <Select style={{ width: '100%' }} userRights={['admin', 'manager']} token={token} decypher={decypher}
          value={user ? user : null}
          onChange={(value: any) => { setUser(value) }}
          options={
            users ? (users as []).map(user => (
              { key: user['id'], value: user['id'], label: user['name'] }
            )) : null
          } />
        <h1 style={{ margin: 10 }}>{t('log.select')}</h1>
        <DatePicker style={{ flexGrow: 1 }} picker="month" format='MMMM YYYY' defaultValue={dayjs()} onChange={(e: any) => { setPeriod([e ? e?.startOf('month') : dayjs().startOf('month'), e ? e?.endOf('month') : dayjs()]) }} />
        {false && <Button userRights={['admin', 'manager']} token={token} decypher={decypher} shape="circle" icon={<DeleteOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={confirm} ></Button>}
        {usb && <Button shape="circle" icon={<SaveOutlined style={{ fontSize: '130%' }} />} size="large" type="primary" style={{ margin: 10 }} onClick={saveReport} ></Button>}
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: '100%', y: height ? height - 228 : 0 }}
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
                <Table.Summary.Cell index={0}><b>{period[0] && dayjs(period[0]).format('MMMM YYYY')}
                  <br />{total && total[0] && duration2text(dayjs.duration(total[0]['workdur']))}</b></Table.Summary.Cell>
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

    </div>
  )
},
  (pre, next) => {
    return isEqual(pre, next);
  }
);
export default UserReport

import { Modal, notification, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { ToolOutlined, QuestionCircleOutlined, SyncOutlined, ExclamationCircleOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "../components/Icons"
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import duration from 'dayjs/plugin/duration';
import { Button, RangePicker } from '@/components';
import * as ExcelJs from 'exceljs';
import { saveWorkbook } from "./utils";
import { addTitle, adjustColumnWidth } from './utils/excelUtils';
dayjs.extend(duration);

interface DataType {
  modecode: number;
  picks: number;
  timestamp: any;
}

type Props = {
  token: any;
  usb: any;
  lifetime: any;
};

const ModeLog: React.FC<Props> = ({
  token,
  usb,
  lifetime
}
) => {
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation();
  const [data, setData] = useState();
  const [period, setPeriod] = useState<any>([dayjs().subtract(7, 'days'), dayjs()]);
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
    if (code == 0) { obj = { color: '#000000FF', text: t('tags.mode.init'), details: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (code == 1) { obj = { color: '#43A047FF', text: t('tags.mode.run'), details: t('tags.mode.run'), icon: <SyncOutlined style={{ fontSize: '175%', color: '#43A047FF', paddingInline: 5 }} /> } }
    else if (code == 2) { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), details: t('tags.mode.stop') + ' - ' + t('stop.button'), icon: <ButtonIcon style={{ fontSize: '175%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (code == 3) { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), details: t('tags.mode.stop') + ' - ' + t('stop.warp'), icon: <WarpBeamIcon style={{ fontSize: '175%', color: '#FF7F27FF', paddingInline: 5 }} /> } }
    else if (code == 4) { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), details: t('tags.mode.stop') + ' - ' + t('stop.weft'), icon: <WeftIcon style={{ fontSize: '175%', color: '#FFB300FF', paddingInline: 5 }} /> } }
    else if (code == 5) { obj = { color: '#E53935FF', text: t('tags.mode.stop'), details: t('tags.mode.stop') + ' - ' + t('stop.tool'), icon: <ToolOutlined style={{ fontSize: '175%', color: '#E53935FF', paddingInline: 5 }} /> } }
    else if (code == 6) { obj = { color: '#005498FF', text: t('tags.mode.stop'), details: t('tags.mode.stop') + ' - ' + t('stop.fabric'), icon: <FabricFullIcon style={{ fontSize: '175%', color: '#005498FF', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), details: t('tags.mode.stop') + ' - ' + t('stop.other'), icon: <QuestionCircleOutlined style={{ fontSize: '175%', color: '#00000000', paddingInline: 5 }} /> } }
    return obj;
  }
  const duration2text = (start: any, end: any) => {
    let diff = dayjs.duration(dayjs(!end ? dayjs() : end).diff(start))
    let durstr = (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
    if (durstr == "") durstr = "<1 " + t('shift.secs')
    return durstr
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
        const response = await fetch('http://localhost:3000/logs/startstops/delete', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: period[0], end: period[1] }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
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

  const saveReport = async () => {
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet(t('panel.loom'));
    worksheet.properties.defaultRowHeight = 20;
    worksheet.columns =
      [
        { header: t('log.event'), key: 'modecode', },
        { header: t('tags.picks.descr'), key: 'picks', },
        { header: t('shift.duration'), key: 'duration', },
        { header: t('shift.starttime'), key: 'start', },
      ];
    worksheet.duplicateRow(1, 4, true);
    addTitle(worksheet, t('menu.modelog') + ' ' + lifetime?.type + ' (' + lifetime?.serialno + '）', (period ? period[0].format('L LTS') : dayjs().subtract(7, 'days').format('L LTS')) + ' - ' + (period ? period[1].format('L LTS') : dayjs().format('L LTS')))
    worksheet.getRow(5).font = { name: 'PTSans', family: 4, size: 9, bold: true }
    worksheet.getRow(5).eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFececec' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    worksheet.addRows((data || []).map((record: any) => ({
      ...record,
      modecode: modeCodeObj(record?.modecode).details,
      picks: record?.picks && (Number(record?.picks)),
      duration: duration2text(record.timestamp['lower'], record.timestamp['upper']),
      start: dayjs(record.timestamp['lower']).format('LL LTS'),
    })));
    adjustColumnWidth(worksheet);
    const json = await saveWorkbook(workbook, t('menu.modelog') + '_' + lifetime?.type + '_(' + lifetime?.serialno + ')_' + ((period ? period[0].format('L LTS') : dayjs().subtract(7, 'days').format('L LTS')) + '_' + (period ? period[1].format('L LTS') : dayjs().format('L LTS'))) + '.xlsx');
    openNotificationWithIcon((json?.error || json == null) ? 'warning' : 'success', t(json?.message || 'notifications.servererror'), 3, '', (json?.error || json == null) ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
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
      title: t('log.event'),
      dataIndex: 'modecode',
      key: 'modecode',
      filters: [
        {
          text: <span>{modeCodeObj(0).icon} {modeCodeObj(0).text}</span>,
          value: 0,
        },
        {
          text: <span>{modeCodeObj(1).icon} {modeCodeObj(1).text}</span>,
          value: 1,
        },
        {
          text: <span>{modeCodeObj(2).icon} {modeCodeObj(2).text}</span>,
          value: 2,
        },
        {
          text: <span>{modeCodeObj(3).icon} {modeCodeObj(3).text}</span>,
          value: 3,
        },
        {
          text: <span>{modeCodeObj(4).icon} {modeCodeObj(4).text}</span>,
          value: 4,
        },
        {
          text: <span>{modeCodeObj(5).icon} {modeCodeObj(5).text}</span>,
          value: 5,
        },
        {
          text: <span>{modeCodeObj(6).icon} {modeCodeObj(6).text}</span>,
          value: 6,
        },
      ],
      onFilter: (value, record) => record.modecode == value,
      ellipsis: true,
      width: '45%',
      render: (_, record) => <b>{modeCodeObj(record.modecode).icon} {' ' + modeCodeObj(record.modecode).text}</b>
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
      title: t('shift.duration'),
      dataIndex: 'timestamp',
      key: 'duration',
      //sorter: (a, b) => dayjs.duration(dayjs(a.timestamp.upper).diff(a.timestamp.lower)).asMilliseconds() - dayjs.duration(dayjs(b.timestamp.upper).diff(b.timestamp.lower)).asMilliseconds(),
      //sortOrder: sortedInfo.columnKey === 'duration' ? sortedInfo.order : null,
      ellipsis: true,
      width: '20%',
      render: (_, record) => duration2text(record.timestamp['lower'], record.timestamp['upper']),
    },
    {
      title: t('shift.starttime'),
      dataIndex: 'timestamp',
      key: 'start',
      sorter: (a, b) => dayjs(a.timestamp.lower).unix() - dayjs(b.timestamp.lower).unix(),
      sortOrder: sortedInfo.columnKey === 'start' ? sortedInfo.order : null,
      ellipsis: true,
      render: (_, record) => dayjs(record.timestamp['lower']).format('LL LTS'),
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/logs/startstops', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ start: period ? period[0] : dayjs().subtract(7, 'days'), end: period ? period[1] : dayjs() }),
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setPagination({ ...pagination, total: json.length });
      setData(json);
      setLoading(false);
    }
    catch (error) { /*console.log(error);*/ }
  };

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)

    return () => { }
  }, [])

  useEffect(() => {
    if (typeof pagination.defaultPageSize == 'undefined') {
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height - 165) / 45) : 8, pageSize: height ? Math.floor((height - 165) / 45) : 8 })
    }
    return () => { }
  }, [pagination])

  useEffect(() => {
    dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
    fetchData();
    return () => { }
  }, [period]);

  return (
    <div ref={div} className='wrapper'>
      <div>
        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}><h1 style={{ margin: 10 }}>{t('log.select')}</h1>
          <RangePicker style={{ flexGrow: 1 }} defaultValue={[dayjs().subtract(7, 'days'), dayjs()]} onChange={(e: any) => { setPeriod([e ? e[0]?.startOf('minute') : dayjs().startOf('day'), e ? e[1]?.endOf('minute') : dayjs()]) }} />
          <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<DeleteOutlined />} size="large" type="primary" danger={true} style={{ margin: 10 }} onClick={confirm} ></Button>
          {usb && <Button shape="circle" icon={<SaveOutlined style={{ fontSize: '130%' }} />} size="large" type="primary" style={{ margin: 10 }} onClick={saveReport} ></Button>}
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

export default ModeLog

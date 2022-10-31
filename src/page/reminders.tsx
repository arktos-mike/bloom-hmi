import { Button, Modal, notification, Space, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined, UploadOutlined, ExclamationCircleOutlined, DeleteOutlined, MinusCircleTwoTone, PlusCircleTwoTone } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, DatePicker, Input, InputNumber, Select, TextArea } from '@/components';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
interface DataType {
  id: React.Key;
  active: boolean;
  title: string;
  descr: string;
  type: number;
  starttime: any;
  runcondition: string;
  nexttime: any | null;
  nextrun: number | null;
  acknowledged: boolean;
}

type Props = {
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
  setUpdatedReminders: (val: boolean) => void;
};

const Reminders: React.FC<Props> = ({
  activeInput,
  setActiveInput,
  setUpdatedReminders
}
) => {
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default'
  });
  const handleAdd = () => {
    const newData: DataType = {
      id: data.length ? Number(data.slice(-1)[0].id) + 1 : 1,
      active: true,
      title: '',
      descr: '',
      type: 0,
      starttime: dayjs(),
      runcondition: '0.0',
      nexttime: null,
      nextrun: null,
      acknowledged: false
    };
    setData([...data, newData]);
    setPagination({ ...pagination, total: data.length + 1 });
  };

  const handleSave = (row: DataType) => {
    const newData = [...data];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setData(newData);
  };
  const handleDelete = (id: React.Key) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    setPagination({ ...pagination, total: data.length - 1 });
  };
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/reminders/', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { throw Error(response.statusText); }
    }
    catch (error) { console.log(error) }
    setUpdatedReminders(true);
    fetchData();
  };
  const handleChange: TableProps<DataType>['onChange'] = (pagination, currentDataSource) => {
    pagination.total = data.length
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

  const confirmSave = () => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: () => { handleSubmit() },
    });
  };
  const confirm = (id: React.Key) => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: () => { handleDelete(id) },
    });
  };

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    setActiveInput({ ...activeInput, form: '', id: '' });
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof pagination.defaultPageSize == 'undefined') {
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height - 100) / 73) : 5, pageSize: height ? Math.floor((height - 100) / 73) : 5 })
    }
  }, [pagination])


  const columns: ColumnsType<DataType> = [
    {
      title: t('reminders.active'),
      dataIndex: 'active',
      width: '2%',
      render: (_, record) => (<Checkbox checked={record.active} onChange={() => { record.active = !record.active; handleSave(record); }}></Checkbox>),
    },
    Table.EXPAND_COLUMN,
    {
      title: t('reminders.title.self'),
      dataIndex: 'title',
      render: (_, record) => (<Input size="large" placeholder={t('reminders.title.placeholder')} value={activeInput.id == ('title' + record.id) ? activeInput.input : record.title} onUpdate={(value: any) => { record.title = value; handleSave(record); }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'reminders', id: 'title' + record.id, num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }); }} />),
    },
    {
      title: t('shift.starttime'),
      dataIndex: 'starttime',
      width: '23%',
      render: (_, record) => (<DatePicker showTime defaultValue={dayjs(record.starttime, 'L HH:mm')} format={'L HH:mm'} onChange={(value: any) => { record.starttime = dayjs(value).format('L HH:mm'); handleSave(record); }} />),
    },
    {
      title: t('reminders.type'),
      dataIndex: 'type',
      width: '10%',
      render: (_, record) => (<Select defaultValue={record.type} onChange={(value: any) => { record.type = value; handleSave(record); }} options={[{ label: t('reminders.onPeriod'), value: 0 }, { label: t('reminders.onRunMeters'), value: 1 }, { label: t('reminders.onRunTime'), value: 2 }]} />),
    },
    {
      title: t('reminders.runcondition.self'),
      dataIndex: 'runcondition',
      width: '14%',
      render: (_, record) => (<InputNumber tag={null} eng={record.type == 1 ? t('tags.planOrderLength.eng') : t('shift.hours')} value={activeInput.id == ('runcondition' + record.id) ? activeInput.input : record.runcondition} placeholder={t('reminders.runcondition.placeholder')} controls={false} onUpdate={(value: any) => { record.runcondition = value.toString(); handleSave(record); }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'reminders', id: 'runcondition' + record.id, num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }); }} />),
    },
    {
      title: t('reminders.acknowledged'),
      dataIndex: 'acknowledged',
      width: '2%',
      render: (_, record) => (<Checkbox checked={record.acknowledged} onChange={() => { record.acknowledged = !record.acknowledged; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('user.action'),
      render: (_, record: { id: React.Key }) => (
        <Space size="middle">
          <Button shape="circle" icon={<DeleteOutlined />} size="large" type="primary" danger={true} onClick={() => { confirm(record.id) }}></Button>
        </Space>
      ),
      width: '5%',
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/reminders');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({ ...pagination, total: json.length });
      json.map((row: any) => {
        row.starttime = dayjs(row.starttime)
      });
      setData(json);
      setLoading(false);
    }
    catch (error) { console.log(error); }
  };

  return (
    <div>
      <Button shape="circle" icon={< PlusOutlined />} size="large" type="primary" style={{ margin: 10, background: "#87d068", borderColor: "#87d068" }} onClick={handleAdd}></Button>
      <Button shape="circle" icon={< UploadOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={confirmSave}></Button>
      <Table
        columns={columns}
        rowKey={record => record.id}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        expandable={{
          expandedRowRender: record =>
            <TextArea size="large" placeholder={t('reminders.descr.placeholder')} value={activeInput.id == ('descr' + record.id) ? activeInput.input : record.descr} onUpdate={(value: any) => { record.descr = value; handleSave(record); }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'reminders', id: 'descr' + record.id, num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }); }} />,
          rowExpandable: record => true,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <MinusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
            ) : (
              <PlusCircleTwoTone style={{ fontSize: '150%' }} onClick={e => onExpand(record, e)} />
            )
        }}
        size='small'
        style={{ width: '100%' }}
        onChange={handleChange}
        showSorterTooltip={false}
      />
    </div>
  )
}

export default Reminders

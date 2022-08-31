import { Button, Modal, notification, Space, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined, UploadOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Checkbox, Input, Select, TimePicker } from '@/components';
import format from 'dayjs';
import dayjs from 'dayjs';

interface DataType {
  key: React.Key;
  shiftname: string;
  starttime: string;
  duration: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

type Props = {
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
  token: any;
};

const Shifts: React.FC<Props> = ({
  activeInput,
  setActiveInput,
  token
}
) => {
  const { t } = useTranslation();
  const [data, setData] = useState<DataType[]>([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultPageSize: 5, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default'
  });
  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      shiftname: `${count}`,
      starttime: '08:00',
      duration: 8,
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    };
    setData([...data, newData]);
    setCount(count + 1);
  };
  const handleSave = (row: DataType) => {
    console.log(row)
    const newData = [...data];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setData(newData);
  };
  const handleDelete = (key: React.Key) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
  };
  const handleSubmit = () => {
    console.log(data)
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

  const columns: ColumnsType<DataType> = [
    {
      title: t('shift.shift'),
      dataIndex: 'shiftname',
      width: '10%',
      render: (_, record) => (<Input size="large" placeholder={t('shift.shift')} value={activeInput.id == ('shiftname' + record.key) ? activeInput.input : record.shiftname} onUpdate={(value: any) => { record.shiftname = value; handleSave(record); }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'shift', id: 'shiftname' + record.key, num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'shift' }); }} />),
    },
    {
      title: t('shift.starttime'),
      dataIndex: 'starttime',
      width: '15%',
      render: (_, record) => (<TimePicker showNow={false} defaultValue={dayjs(record.starttime, 'HH:mm')} format={'HH:mm'} onChange={(value: any) => { record.starttime = dayjs(value).format('HH:mm'); handleSave(record); }} />),
    },
    {
      title: t('shift.duration'),
      dataIndex: 'duration',
      width: '10%',
      render: (_, record) => (<Select defaultValue={record.duration} onChange={(value: any) => { record.duration = value; handleSave(record); }} options={[{ label: 6 + ' ' + t('shift.hours'), value: 6 }, { label: 7 + ' ' + t('shift.hours'), value: 7 }, { label: 8 + ' ' + t('shift.hours'), value: 8 }, { label: 9 + ' ' + t('shift.hours'), value: 9 }, { label: 10 + ' ' + t('shift.hours'), value: 10 }, { label: 11 + ' ' + t('shift.hours'), value: 11 }, { label: 12 + ' ' + t('shift.hours'), value: 12 }]}>
      </Select>),
    },
    {
      title: t('shift.monday'),
      dataIndex: 'monday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.monday} onChange={() => { record.monday = !record.monday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.tuesday'),
      dataIndex: 'tuesday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.tuesday} onChange={() => { record.tuesday = !record.tuesday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.wednesday'),
      dataIndex: 'wednesday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.wednesday} onChange={() => { record.wednesday = !record.wednesday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.thursday'),
      dataIndex: 'thursday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.thursday} onChange={() => { record.thursday = !record.thursday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.friday'),
      dataIndex: 'friday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.friday} onChange={() => { record.friday = !record.friday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.saturday'),
      dataIndex: 'saturday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.saturday} onChange={() => { record.saturday = !record.saturday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('shift.sunday'),
      dataIndex: 'sunday',
      width: '8%',
      render: (_, record) => (<Checkbox checked={record.sunday} onChange={() => { record.sunday = !record.sunday; handleSave(record); }}></Checkbox>),
    },
    {
      title: t('user.action'),
      render: (_, record: { key: React.Key }) => (
        <Space size="middle">
          <Button shape="circle" icon={<DeleteOutlined />} size="large" type="primary" danger={true} onClick={() => { confirm(record.key) }}></Button>
        </Space>
      ),
      width: '5%',
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({
        total: json.length,
        defaultPageSize: 6, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default'
      });
      //setData(json);
      setLoading(false);

    }
    catch (error) { console.log(error); }
  };

  return (
    <div>
      <Button shape="circle" icon={< PlusOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={handleAdd}></Button>
      <Button shape="circle" icon={< UploadOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={handleSubmit}></Button>
      <Table
        columns={columns}
        rowKey={record => record.key}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        size='small'
        style={{ width: '100%' }}
        onChange={handleChange}
      />
    </div>
  )
}

export default Shifts
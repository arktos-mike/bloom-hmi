import { Button, Modal, notification, Space, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined, UploadOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Input, Select, TimePicker } from '@/components';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
interface DataType {
  key: React.Key;
  shiftname: string;
  starttime: string;
  duration: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  problemName: boolean;
  problemTime: boolean;
  problemDur: boolean;
}

type Props = {
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};

const Reminders: React.FC<Props> = ({
  activeInput,
  setActiveInput
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
      key: data.length ? Number(data.slice(-1)[0].key) + 1 : 1,
      shiftname: `${data.length ? Number(data.slice(-1)[0].key) + 1 : 1}`,
      starttime: data.length ? dayjs(data.slice(-1)[0].starttime, 'HH:mm').add(parseInt(data.length ? data.slice(-1)[0].duration : '8H'), 'h').format('HH:mm') : '00:00',
      duration: data.length ? data.slice(-1)[0].duration : '8H',
      monday: data.length ? data.slice(-1)[0].monday : true,
      tuesday: data.length ? data.slice(-1)[0].tuesday : true,
      wednesday: data.length ? data.slice(-1)[0].wednesday : true,
      thursday: data.length ? data.slice(-1)[0].thursday : true,
      friday: data.length ? data.slice(-1)[0].friday : true,
      saturday: data.length ? data.slice(-1)[0].saturday : false,
      sunday: data.length ? data.slice(-1)[0].sunday : false,
      problemName: false,
      problemTime: false,
      problemDur: false,
    };
    rulesCheck([...data, newData]);
    setData([...data, newData]);
    setPagination({ ...pagination, total: data.length + 1 });
  };

  const handleSave = (row: DataType) => {
    const newData = [...data];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];

    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setData(newData);
    rulesCheck(newData);
  };
  const handleDelete = (key: React.Key) => {
    const newData = data.filter(item => item.key !== key);
    setData(newData);
    setPagination({ ...pagination, total: data.length - 1 });
    rulesCheck(newData);
  };
  const handleSubmit = async () => {
    const table = data.map(({ key, problemName, problemTime, problemDur, ...rest }) => {
      rest.starttime=dayjs(rest.starttime, 'HH:mm').format('HH:mmZ');
      return rest;
    });
    try {
      if (rulesCheck(data)) {
        openNotificationWithIcon('warning', t('notifications.dataerror'), 3);
      }
      else {
        const response = await fetch('http://localhost:3000/shifts/', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify(table),
        });
        const json = await response.json();
        openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
        if (!response.ok) { throw Error(response.statusText); }
      }
    }
    catch (error) { console.log(error) }
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
  const isNextDay = (data: DataType) => {
    return (dayjs(data.starttime, "HH:mm").add(parseInt(data.duration), 'hour').date() != dayjs(data.starttime, "HH:mm").date() ? true : false)
  }
  const hasSameDay = (prevData: DataType, nextData: DataType) => {
    return ((prevData.monday || isNextDay(prevData) && prevData.sunday) && nextData.monday) || ((prevData.tuesday || isNextDay(prevData) && prevData.monday) && nextData.tuesday) || ((prevData.wednesday || isNextDay(prevData) && prevData.tuesday) && nextData.wednesday) || ((prevData.thursday || isNextDay(prevData) && prevData.wednesday) && nextData.thursday) || ((prevData.friday || isNextDay(prevData) && prevData.thursday) && nextData.friday) || ((prevData.saturday || isNextDay(prevData) && prevData.friday) && nextData.saturday) || ((prevData.sunday || isNextDay(prevData) && prevData.saturday) && nextData.sunday)
  }
  const rulesCheck = (data: DataType[]) => {
    let result = false;
    data.filter((obj, index, array) => {
      obj.problemName = false;
      obj.problemTime = false;
      obj.problemDur = false;
      for (let i = 0; i < array.length; i++) {
        if (i != index && array[i].shiftname == obj.shiftname) {
          obj.problemName = true;
          result = true;
        }
        if (i < index && hasSameDay(array[i], obj) && dayjs(obj.starttime, "HH:mm").add(isNextDay(array[i]) ? 1 : 0, 'day').isBefore(dayjs(array[i].starttime, "HH:mm"))) {
          obj.problemTime = true;
          result = true;
        }
        if (i < index && hasSameDay(array[i], obj) && dayjs(obj.starttime, "HH:mm").add(isNextDay(array[i]) ? 1 : 0, 'day').isBefore(dayjs(array[i].starttime, "HH:mm").add(parseInt(array[i].duration), 'hour')))  {
          obj.problemTime = true;
          array[i].problemDur = true;
          result = true;
        }
        if (i < index && hasSameDay(obj, array[i]) && isNextDay(obj) && dayjs(obj.starttime, "HH:mm").add(parseInt(obj.duration), 'hour').isAfter(dayjs(array[i].starttime, "HH:mm").add( 1 , 'day')))  {
          obj.problemDur = true;
          array[i].problemTime = true;
          result = true;
        }
      }
    });
    setData(data);
    return result;
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
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height-100) / 73) : 5, pageSize: height ? Math.floor((height-100) / 73) : 5})
    }
  }, [pagination])


  const columns: ColumnsType<DataType> = [
    {
      title: t('shift.shift'),
      dataIndex: 'shiftname',
      width: '10%',
      render: (_, record) => (<Input size="large" placeholder={t('shift.shift')} value={activeInput.id == ('shiftname' + record.key) ? activeInput.input : record.shiftname} onUpdate={(value: any) => { record.shiftname = value; handleSave(record); }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'shift', id: 'shiftname' + record.key, num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'shift' }); }} status={record.problemName ? 'error' : null} />),
    },
    {
      title: t('shift.starttime'),
      dataIndex: 'starttime',
      width: '15%',
      render: (_, record) => (<TimePicker showNow={false} minuteStep={15} defaultValue={dayjs(record.starttime, 'HH:mm')} format={'HH:mm'} onChange={(value: any) => { record.starttime = dayjs(value).format('HH:mm'); handleSave(record); }} status={record.problemTime ? 'error' : null} />),
    },
    {
      title: t('shift.duration'),
      dataIndex: 'duration',
      width: '10%',
      render: (_, record) => (<Select defaultValue={record.duration} onChange={(value: any) => { record.duration = value; handleSave(record); }} options={[{ label: 6 + ' ' + t('shift.hours'), value: '6H' }, { label: 7 + ' ' + t('shift.hours'), value: '7H' }, { label: 8 + ' ' + t('shift.hours'), value: '8H' }, { label: 9 + ' ' + t('shift.hours'), value: '9H' }, { label: 10 + ' ' + t('shift.hours'), value: '10H' }, { label: 11 + ' ' + t('shift.hours'), value: '11H' }, { label: 12 + ' ' + t('shift.hours'), value: '12H' }]} status={record.problemDur ? 'error' : null} />),
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
      const response = await fetch('http://localhost:3000/shifts');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setPagination({ ...pagination, total: json.length });
      let count = 1;
      json.map((row: any) => {
        row.key = count
        row.starttime = dayjs(row.starttime, 'HH:mmZ').format('HH:mm')
        row.duration = row.duration.hours + 'H'
        row.problemName = false
        row.problemTime = false
        row.problemDur = false
        count++
      });
      setData(json);
      setLoading(false);
      rulesCheck(json);
    }
    catch (error) { console.log(error); }
  };

  return (
    <div>
      <Button shape="circle" icon={< PlusOutlined />} size="large" type="primary" style={{ margin: 10, background: "#87d068", borderColor: "#87d068" }} onClick={handleAdd}></Button>
      <Button shape="circle" icon={< UploadOutlined />} size="large" type="primary" style={{ margin: 10 }} onClick={confirmSave}></Button>
      <Table
        columns={columns}
        rowKey={record => record.key}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        size='small'
        style={{ width: '100%' }}
        onChange={handleChange}
        showSorterTooltip={false}
      />
    </div>
  )
}

export default Reminders

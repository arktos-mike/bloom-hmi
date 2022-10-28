import { Modal, notification, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { LogoutOutlined, UserSwitchOutlined, InteractionOutlined, UnlockOutlined, IdcardOutlined, FieldTimeOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Button, RangePicker } from '@/components';
dayjs.extend(duration);

interface DataType {
  id: number;
  name: string;
  role: string;
  loginby: string;
  logoutby: string;
  timestamp: any;
}

type Props = {
  token: any;
};

const UserLog: React.FC<Props> = ({
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

  const logCase = (code: string) => {
    let obj;
    if (code == 'password') { obj = <UnlockOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'id') { obj = <IdcardOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'delete') { obj = <DeleteOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'userpassword') { obj = <UserSwitchOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'userid') { obj = <UserSwitchOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'rolechange') { obj = <InteractionOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'idle') { obj = <FieldTimeOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else if (code == 'button') { obj = <LogoutOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    else { obj = <QuestionCircleOutlined style={{ fontSize: '175%', color: '#0000003F', paddingInline: 5 }} /> }
    return obj;
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
        const response = await fetch('http://localhost:3000/logs/userlog/delete', {
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
      title: t('user.id'),
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === 'id' ? sortedInfo.order : null,
      ellipsis: true,
      width: '10%',
    },
    {
      title: t('user.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: t('user.role'),
      dataIndex: 'role',
      render: role => <Tag color={role == 'fixer' ? "#108ee9" : role == 'weaver' ? "#87d068" : role == 'manager' ? "#2db7f5" : "#f50"}>{t('user.' + role)}</Tag>,
      filters: [
        {
          text: t('user.weaver'),
          value: `${t('user.weaver')}`,
        },
        {
          text: t('user.fixer'),
          value: `${t('user.fixer')}`,
        },
        {
          text: t('user.manager'),
          value: `${t('user.manager')}`,
        },
        {
          text: t('user.admin'),
          value: `${t('user.admin')}`,
        },
      ],
      onFilter: (value, record) => t('user.' + record.role) === value,
      width: '12%',
    },
    {
      title: t('log.login'),
      dataIndex: 'timestamp',
      key: 'login',
      sorter: (a, b) => dayjs(a.timestamp.lower).unix() - dayjs(b.timestamp.lower).unix(),
      sortOrder: sortedInfo.columnKey === 'login' ? sortedInfo.order : null,
      ellipsis: true,
      render: (_, record) => <span>{logCase(record.loginby)} {' ' + dayjs(record.timestamp['lower']).format('LL LTS')}</span>,
      width: '30%',
    },
    {
      title: t('log.logout'),
      dataIndex: 'timestamp',
      key: 'logout',
      sorter: (a, b) => dayjs(a.timestamp.upper).unix() - dayjs(b.timestamp.upper).unix(),
      sortOrder: sortedInfo.columnKey === 'logout' ? sortedInfo.order : null,
      ellipsis: true,
      render: (_, record) => <span>{logCase(record.logoutby)} {' ' + (record.timestamp['upper'] ? dayjs(record.timestamp['upper']).format('LL LTS') : '')}</span>,
      width: '30%',
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/logs/userlog', {
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
    dayjs.locale(i18n.language)
    fetchData();
  }, [period]);

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
  }, [])

  useEffect(() => {
    if (typeof pagination.defaultPageSize == 'undefined') {
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height - 165) / 45) : 8, pageSize: height ? Math.floor((height - 165) / 45) : 8 })
    }
  }, [pagination])

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

export default UserLog

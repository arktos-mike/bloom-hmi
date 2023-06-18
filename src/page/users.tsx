import { Button, Modal, notification, Space, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import UserEditSA from "../dialog/UserEditSA";
import UserRegister from "../dialog/UserRegister";
interface DataType {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  role: string;
}

type Props = {
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
  token: any;
  decypher: any;
};

const Users: React.FC<Props> = ({
  activeInput,
  setActiveInput,
  token,
  decypher
}
) => {
  const [height, setHeight] = useState<number | undefined>(0)
  const div = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const [user, setUser] = useState({})
  const [editVisible, setEditVisible] = useState(false)
  const [regVisible, setRegVisible] = useState(false)
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    hideOnSinglePage: true, responsive: true, position: ["bottomCenter"], size: 'default'
  });
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, currentDataSource) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    pagination.total = currentDataSource.currentDataSource.length
    setPagination(pagination);
  };

  const handleDelete = async (id: Number) => {
    try {
      const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/users/' + id, {
        method: 'DELETE',
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
    }
    catch (error) { console.log(error) }
    fetchData();
  }

  const handleEdit = async (user: any) => {
    setUser(user);
    setEditVisible(true);
  }

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
  const confirm = (id: Number) => {
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
      title: t('user.email'),
      dataIndex: 'email',
      width: '20%',
      ellipsis: true,
    },
    {
      title: t('user.phone'),
      dataIndex: 'phonenumber',
      render: phonenumber => phonenumber ? `+ ${phonenumber}` : '',
      width: '13%',
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
      ],
      onFilter: (value, record) => t('user.' + record.role) === value,
      width: '10%',
    },
    {
      title: t('user.action'),
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button shape="circle" icon={< EditOutlined />} size="large" type="primary" onClick={() => { handleEdit(record) }}></Button>
          {record.id == ((token && decypher) ? decypher?.id : '') ? <Button shape="circle" icon={<PlusOutlined />} size="large" type="primary" style={{ background: "#87d068", borderColor: "#87d068" }} onClick={() => { setRegVisible(true) }}></Button> : <Button shape="circle" icon={<DeleteOutlined />} size="large" type="primary" danger={true} onClick={() => { confirm(record.id) }}></Button>}
        </Space>
      ),
      width: '13%',
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/users');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setPagination({ ...pagination, total: json.length });
      setData(json);
      setLoading(false);

    }
    catch (error) { /*console.log(error);*/ }
  };

  useEffect(() => {
    setActiveInput({ ...activeInput, form: '', id: '' });
    fetchData();
    return () => { }
  }, [editVisible, regVisible]);

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    return () => { }
  }, [])

  useEffect(() => {
    if (typeof pagination.defaultPageSize == 'undefined') {
      setPagination({ ...pagination, defaultPageSize: height ? Math.floor((height - 100) / 70) : 6, pageSize: height ? Math.floor((height - 100) / 70) : 6 })
    }
    return () => { }
  }, [pagination])

  return (
    <div ref={div} className='wrapper'>
      <div>
        <Table
          columns={columns}
          rowKey={record => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          size='small'
          style={{ width: '100%' }}
          onChange={handleChange}
          showSorterTooltip={false}
        />
        <UserEditSA isModalVisible={editVisible} setIsModalVisible={setEditVisible} user={user} activeInput={activeInput} setActiveInput={setActiveInput} />
        <UserRegister isModalVisible={regVisible} setIsModalVisible={setRegVisible} activeInput={activeInput} setActiveInput={setActiveInput} token={token} decypher={decypher} />
      </div>
    </div>
  )
}

export default Users

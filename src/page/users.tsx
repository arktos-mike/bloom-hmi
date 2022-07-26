import { Button, Modal, notification, Space, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import UserEditSA from "../dialog/UserEditSA";

interface DataType {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  role: string;
}

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({})
  const [editVisible, setEditVisible] = useState(false)
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    defaultPageSize: 12, hideOnSinglePage: true, responsive: true, position: ["bottomCenter"]
  });
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    setPagination(pagination);
  };

  const handleDelete = async (id:Number) => {
    try {
        const response = await fetch('http://localhost:3000/users/' + id, {
            method: 'DELETE',
        });
        const json = await response.json();
        openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
        if (!response.ok) { throw Error(response.statusText); }
    }
    catch (error) { console.log(error) }
    fetchData();
}

const handleEdit = async (user:any) => {
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
  const confirm = (id:Number) => {
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
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
      width: '15%',
    },
    {
      title: t('user.phone'),
      dataIndex: 'phonenumber',
      render: phonenumber => phonenumber ? `+ ${phonenumber}` : '',
      width: '15%',
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
          <Button size="middle" type="primary" onClick={() => { handleEdit(record) }}>{t('user.editsubmit')}</Button>
          <Button disabled={record.role=='sa'?true:false} size="middle" type="primary" danger={true} onClick={() => { confirm(record.id) }}>{t('user.delete')}</Button>
        </Space>
      ),
      width: '20%',
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
      });
      setData(json);
      setLoading(false);
      
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchData();
  }, [editVisible]);

  return (
    <div>
      <div><h1>{t('menu.users')}</h1>
        <Table
          columns={columns}
          rowKey={record => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          size='large'
          style={{ width: '100%' }}
          onChange={handleChange}
        />
        <UserEditSA isModalVisible={editVisible} setIsModalVisible={setEditVisible} user={user} />
      </div>
    </div>
  )
}

export default Users
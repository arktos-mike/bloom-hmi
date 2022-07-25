import { Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

interface DataType {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  role: string;
}



const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
  });
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const handleChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
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
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      width: '20%',
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
      width: '20%',
    },
    {
      title: t('user.phone'),
      dataIndex: 'phonenumber',
      render: phonenumber => phonenumber ? `+ ${phonenumber}` : '',
      width: '20%',
    },
    {
      title: t('user.role'),
      dataIndex: 'role',
      render: role => <Tag color="#108ee9">{t('user.' + role)}</Tag>,
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
    },
  ];
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setData(json);
      setLoading(false);
      setPagination({
        total: json.length,
      });
    }
    catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div><h1>{t('menu.settings')}</h1>
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
      </div>
    </div>
  )
}

export default Settings
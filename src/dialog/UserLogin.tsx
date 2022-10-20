import { useState, useEffect } from 'react'
import { Modal, Button, Form, Input, Checkbox, notification, Select } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import UserEdit from "./UserEdit";
import UserRegister from "./UserRegister";

const { Option } = Select;

type Props = {
  isModalVisible: boolean;
  token: any;
  shadowUser: any;
  setToken: (val: any) => void;
  setRemember: (val: boolean) => void;
  setIsModalVisible: (val: boolean) => void;
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};

const UserLogin: React.FC<Props> = ({
  isModalVisible,
  setIsModalVisible,
  token,
  shadowUser,
  setToken,
  setRemember,
  activeInput,
  setActiveInput,
}) => {

  const [form] = Form.useForm()
  const [state, setState] = useState({ data: [] })
  const [search, setSearch] = useState('')
  const [editVisible, setEditVisible] = useState(false)
  const [showList, setShowList] = useState(false)
  const [listNotEmpty, setListNotEmpty] = useState(false)
  const [regVisible, setRegVisible] = useState(false)
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/names');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setState({ data: json });
    }
    catch (error) { console.log(error); }
  }

  useEffect(() => {
    fetchData()
    if (form && isModalVisible) form.resetFields()
  }, [isModalVisible, editVisible, regVisible])

  useEffect(() => {
    if (form && isModalVisible && activeInput.form == 'login') {
      if (activeInput.id == 'name') {
        setSearch(activeInput.input);
        if (search || activeInput.input) { setShowList(true); }
      } else {
        form.setFieldsValue({ [activeInput.id]: activeInput.input })
      }
    }
  }, [activeInput])

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
  const { t } = useTranslation();
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }
  const handleOk = async () => {
    form.resetFields();
    try {
      const res = await fetch('http://localhost:3000/users/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ id: JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id, logoutby: 'button' }),
      });
      if (!res.ok) { throw Error(res.statusText); }
      const ans = await fetch('http://localhost:3000/logs/user');
      const json = await ans.json();
      if (!ans.ok) { throw Error(ans.statusText); }
      if (json.length) {
        const response = await fetch('http://localhost:3000/users/login/' + json[0].id, {
          method: 'POST'
        });
        const jsonb = await response.json();
        setToken(jsonb.token || null);
        if (!response.ok) { throw Error(response.statusText); }
      }
      else { setToken(null); }
    }
    catch (error) { console.log(error); }
  }

  const onFinish = async (values: { user: any; password: any; remember: boolean; }) => {
    try {
      if (values.user != (token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : null)) {
        const response = await fetch('http://localhost:3000/users/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ name: values.user, password: values.password, }),
        });
        const json = await response.json();
        setToken(json.token || token);
        openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
        if (!response.ok) { throw Error(response.statusText); }
      }
      setRemember(values.remember);
    }
    catch (error) { console.log(error) }
    //setIsModalVisible(false)
  }

  return (
    <Modal
      title={t('user.signin')}
      okButtonProps={{ size: 'large' }}
      okText={t('user.logout')}
      cancelText={t('menu.close')}
      cancelButtonProps={{ size: 'large' }}
      onOk={handleOk}
      onCancel={handleCancel}
      open={isModalVisible}
      destroyOnClose={true}
      //centered={true}
      afterClose={() => { setShowList(false) }}
      getContainer={false}
      style={{ top: 20 }}
    >
      <div className="sel">
        <Form
          name="login"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          size='middle'
          onFinish={onFinish}
          form={form}
          preserve={false}
        >
          <Form.Item
            label={t('user.curuser')}
          >
            <span className="text" style={{ color: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? "#108ee9" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? "#87d068" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? "#2db7f5" : "#f50" : "" }}>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</span>
          </Form.Item>
          {shadowUser.name && <Form.Item
            label={t('user.weaver')}
          >
            <span className="text" style={{ color: "#87d068" }}>{shadowUser.name}</span>
          </Form.Item>}
          <Form.Item
            label={t('user.user')}
            name="user"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Select showSearch open={showList} searchValue={search} onFocus={() => { if (!showList || (showList && search && !listNotEmpty)) { setActiveInput({ showKeyboard: true, num: false, showInput: true, form: 'login', id: 'name', input: search, descr: t('user.user'), pattern: 'username' }) } else { setActiveInput({ ...activeInput, form: 'login', id: 'name', input: search }); } }} onSearch={(value) => { setSearch(value); setActiveInput({ ...activeInput, input: value }); }} onSelect={() => { setListNotEmpty(false); setShowList(false); setSearch(''); setActiveInput({ ...activeInput, showKeyboard: false, input: '' }); }}
              filterOption={(input, option) => (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())} placeholder={t('user.user')} virtual={true} size="large" suffixIcon={<UserOutlined style={{ fontSize: '120%' }} />}>
              {(state.data || []).map(user => (
                <Option key={user['name']} value={user['name']} label={user['name']} onMouseEnter={() => { setListNotEmpty(true) }}>
                  {user['name']}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t('user.password')}
            name="password"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Input.Password onChange={e => { setActiveInput({ ...activeInput, input: e.target.value }); }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'login', id: 'password', num: false, showInput: false, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} visibilityToggle={true} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
            <Checkbox>{t('user.remember')}</Checkbox>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }} style={{ marginTop: 15 }}>
            <Button size="large" type="primary" htmlType="submit" >
              {t('user.login')}
            </Button>
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }} hidden={!token} >
            <Button type="link" onClick={() => { setEditVisible(true); }}>{t('user.change')}</Button>
            <UserEdit isModalVisible={editVisible} setIsModalVisible={setEditVisible} token={token} setToken={setToken} activeInput={activeInput} setActiveInput={setActiveInput} />
          </Form.Item >
          {token && <Form.Item wrapperCol={{ offset: 8, span: 16 }} >
            <Button type="link" onClick={() => { setRegVisible(true); }}>{t('user.register')}</Button>
            <UserRegister isModalVisible={regVisible} setIsModalVisible={setRegVisible} activeInput={activeInput} setActiveInput={setActiveInput} token={token} />
          </Form.Item >}
        </Form>
      </div>
    </Modal>
  )
}
export default UserLogin;

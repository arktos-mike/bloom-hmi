import { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, InputNumber, Select, notification } from 'antd'
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

type Props = {
  isModalVisible: boolean;
  token: any;
  setToken: (val: any) => void;
  setIsModalVisible: (val: boolean) => void;
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};
const UserEdit: React.FC<Props> = ({
  isModalVisible,
  setIsModalVisible,
  token,
  setToken,
  activeInput,
  setActiveInput,
}) => {
  const [form] = Form.useForm()
  const { t } = useTranslation();
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    if (form && isModalVisible && activeInput.form == 'edit') {
      form.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
  }, [activeInput])

  const handleDelete = async (id: Number) => {
    try {
      const response = await fetch('http://localhost:3000/users/' + id, {
        method: 'DELETE',
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
    }
    catch (error) { console.log(error) }
    setIsModalVisible(false)
    form.resetFields()
    setToken(null)
  }
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
      onOk: () => { handleDelete(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id) },
    });
  };
  useEffect(() => {
    if (form && isModalVisible) {
      form.setFieldsValue({
        user: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon'),
        email: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).email : '',
        phone: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).phonenumber : '',
        role: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : ''
      })
    }
  }, [form, token])

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
  const onFinish = async (values: { user: any; oldpassword: any; newpassword: any; email: any; phone: any; role: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/users/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ id: JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id, name: values.user, email: values.email, phonenumber: values.phone, role: values.role, oldpassword: values.oldpassword, newpassword: values.newpassword }),
      });
      const json = await response.json();
      if (json.token) { setToken(json.token); setIsModalVisible(false) }
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
    }
    catch (error) { console.log(error) }
    //setIsModalVisible(false)
  }


  return (
    <Modal
      title={t('user.change')}
      cancelText={t('menu.close')}
      okText={t('user.editsubmit')}
      cancelButtonProps={{ size: 'large' }}
      onOk={form.submit}
      onCancel={handleCancel}
      okButtonProps={{ type: "primary", size: 'large', htmlType: "submit" }}
      open={isModalVisible}
      destroyOnClose={true}
      //centered={true}
      mask={false}
      style={{ top: 0 }}
    >
      <div className="sel">
        <Form
          name="edit"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          size='large'
          onFinish={onFinish}
          form={form}
          preserve={false}
          initialValues={{
            user: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon'),
            email: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).email : '',
            phone: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).phonenumber : '',
            role: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : ''
          }}
        >
          <Form.Item
            label={t('user.user')}
            name="user"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Input placeholder={t('user.user')} size="large" onChange={e => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'edit', id: 'user', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'username' }); }} />
          </Form.Item>

          <Form.Item
            label={t('user.email')}
            name="email"
            rules={[{ type: 'email', message: t('user.wrongemail') }, { required: false, message: t('user.fill') }]}
          >
            <Input placeholder={t('user.email')} size="large" onChange={e => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'edit', id: 'email', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'email' }); }} />
          </Form.Item>

          <Form.Item
            label={t('user.phone')}
            name="phone"
            rules={[{ required: false, message: t('user.fill') }]}
          >
            <InputNumber addonBefore="+" placeholder={t('user.phone')} style={{ width: '100%' }} size="large" controls={false} onChange={value => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'edit', id: 'phone', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'phonenumber' }) }} />
          </Form.Item>

          <Form.Item
            name="role"
            label={t('user.role')}
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Select disabled={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? true : false : false} >
              <Option disabled={token ? false : true} value="weaver">{t('user.weaver')}</Option>
              <Option disabled={token ? ['fixer', 'manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? false : true : true} value="fixer">{t('user.fixer')}</Option>
              <Option disabled={token ? ['manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? false : true : true} value="manager">{t('user.manager')}</Option>
              <Option disabled={token ? (JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? false : true) : true} value='admin'>{t('user.admin')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t('user.oldpassword')}
            name="oldpassword"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Input.Password visibilityToggle={true} placeholder={t('user.password')} size="large" prefix={<LockOutlined className="site-form-item-icon" />} onChange={e => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'edit', id: 'oldpassword', num: false, showInput: false, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} />
          </Form.Item>

          <Form.Item
            label={t('user.newpassword')}
            name="newpassword"
            rules={[{ required: true, message: t('user.fill') }]}
          >
            <Input.Password visibilityToggle={true} placeholder={t('user.password')} size="large" prefix={<LockOutlined className="site-form-item-icon" />} onChange={e => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e) => { setActiveInput({ showKeyboard: true, form: 'edit', id: 'newpassword', num: false, showInput: false, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}
export default UserEdit;

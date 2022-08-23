import { Card, Col, Form, notification, Row, Segmented, Select, } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ApiOutlined } from '@ant-design/icons';
import { Button, InputNumber, Checkbox, Input } from '../components';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }
const { Option } = Select;

type Props = {
  token: any;
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};

const SettingsDev: React.FC<Props> = ({
  token,
  activeInput,
  setActiveInput,
}) => {
  const { t, i18n } = useTranslation();

  let isSubscribed = true;

  const [formCOM] = Form.useForm()
  const [formRTU] = Form.useForm()
  const [opCOM, setOpCOM] = useState({ path: '', scan: 0, timeout: 0, conf: { baudRate: 0, dataBits: 0, stopBits: 0, parity: '' } })
  const [com, setCom] = useState('opCOM1')
  const [rtu, setRtu] = useState({ com: '', sId: 0, swapBytes: true, swapWords: true })

  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  }

  const fetchCOM = async () => {
    try {
      const response = await fetch('http://localhost:3000/config');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      if (isSubscribed) setOpCOM(json['comConf'][com]);
    }
    catch (error) { console.log(error); }
  }

  const fetchRTU = async () => {
    try {
      const response = await fetch('http://localhost:3000/config');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      if (isSubscribed) setRtu(json['rtuConf']['rtu1']);
    }
    catch (error) { console.log(error); }
  }

  const onCOMChange = async (values: { path: any; scan: any; timeout: any; baudRate: any; dataBits: any; stopBits: any; parity: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ [com]: { path: values.path, scan: values.scan, timeout: values.timeout, conf: { baudRate: values.baudRate, dataBits: values.dataBits, stopBits: values.stopBits, parity: values.parity } } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
      fetchCOM();
    }
    catch (error) { console.log(error) }
  }

  const onRTUChange = async (values: { com: any; sId: any; swapBytes: any; swapWords: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ rtu1: { com: values.com, sId: values.sId, swapBytes: values.swapBytes, swapWords: values.swapWords, } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
      fetchRTU();
    }
    catch (error) { console.log(error) }
  }

  useEffect(() => {
    fetchCOM();
    return () => { isSubscribed = false }
  }, [com])

  useEffect(() => {
    if (formCOM && activeInput.form == 'com') {
      formCOM.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    if (formRTU && activeInput.form == 'rtu') {
      formRTU.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
  }, [activeInput])

  useEffect(() => {
    if (formCOM) {
      formCOM.setFieldsValue({ path: opCOM.path, scan: opCOM.scan, timeout: opCOM.timeout, baudRate: opCOM.conf.baudRate, dataBits: opCOM.conf.dataBits, stopBits: opCOM.conf.stopBits, parity: opCOM.conf.parity })
    }
  }, [opCOM])

  useEffect(() => {
    if (formRTU) {
      formRTU.setFieldsValue({ com: rtu.com, sId: rtu.sId, swapBytes: rtu.swapBytes, swapWords: rtu.swapWords })
    }
  }, [rtu])

  useEffect(() => {
    fetchRTU();
    return () => { isSubscribed = false }
  }, [])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.com')} extra={<Segmented size='large' value={com} onChange={(value) => { setCom(value.toString()) }} options={[{ label: 'COM1', value: 'opCOM1', icon: <ApiOutlined />, },
          { label: 'COM2', value: 'opCOM2', icon: <ApiOutlined />, },]}
          />} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              size='large'
              form={formCOM}
              style={{ width: '100%' }}
              onFinish={onCOMChange}
              preserve={false}
              colon={false}
            >
              <Form.Item
                name="path"
                label={t('com.path')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Input userRights={['sa', 'manager']} token={token} placeholder='com.path' style={{ width: '100%' }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'path', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} />
              </Form.Item>
              <Form.Item
                name="scan"
                label={t('com.scan')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber eng tag={{ name: 'comTime' }} userRights={['sa', 'manager']} token={token} placeholder='com.scan' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'scan', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item
                name="timeout"
                label={t('com.timeout')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber eng tag={{ name: 'comTime' }} userRights={['sa', 'manager']} token={token} placeholder='com.timeout' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'timeout', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item
                name="baudRate"
                label={t('com.baudRate')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select size="large">
                  <Option value={9600}>9600</Option>
                  <Option value={19200}>19200</Option>
                  <Option value={38400}>38400</Option>
                  <Option value={57600}>57600</Option>
                  <Option value={115200}>115200</Option>
                  <Option value={230400}>230400</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="dataBits"
                label={t('com.dataBits')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select size="large">
                  <Option value={5}>5</Option>
                  <Option value={6}>6</Option>
                  <Option value={7}>7</Option>
                  <Option value={8}>8</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="stopBits"
                label={t('com.stopBits')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select size="large">
                  <Option value={1}>1</Option>
                  <Option value={1.5}>1.5</Option>
                  <Option value={2}>2</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="parity"
                label={t('com.parity')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select size="large">
                  <Option value="none">{t('com.parity.none')}</Option>
                  <Option value="even">{t('com.parity.even')}</Option>
                  <Option value="mark">{t('com.parity.mark')}</Option>
                  <Option value="odd">{t('com.parity.odd')}</Option>
                  <Option value="space">{t('com.parity.space')}</Option>
                </Select>
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button userRights={['sa', 'manager']} token={token} htmlType="submit" text="com.submit" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.rtu')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              size='large'
              form={formRTU}
              style={{ width: '100%' }}
              onFinish={onRTUChange}
              preserve={false}
              colon={false}
            >
              <Form.Item
                name="com"
                label={t('rtu.com')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select size="large">
                  <Option value="opCOM1">COM1</Option>
                  <Option value="opCOM2">COM2</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="sId"
                label={t('rtu.sId')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber userRights={['sa', 'manager']} token={token} placeholder='rtu.sId' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'rtu', id: 'sId', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item name="swapBytes" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                <Checkbox userRights={['sa', 'manager']} token={token} text='rtu.swapBytes' ></Checkbox>
              </Form.Item>
              <Form.Item name="swapWords" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                <Checkbox userRights={['sa', 'manager']} token={token} text='rtu.swapWords'></Checkbox>
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button userRights={['sa', 'manager']} token={token} htmlType="submit" text="rtu.submit" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsDev
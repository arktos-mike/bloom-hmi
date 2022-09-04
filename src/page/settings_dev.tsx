import { Card, Col, Form, notification, Row, Segmented } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { ApiOutlined } from '@ant-design/icons';
import { Button, InputNumber, Checkbox, Input, Select } from '../components';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardStyle2 = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column', marginBottom: 8, height: '100%' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

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
  const [formTCP] = Form.useForm()
  const [opCOM, setOpCOM] = useState({ path: '', scan: 0, timeout: 0, conf: { baudRate: 0, dataBits: 0, stopBits: 0, parity: '' } })
  const [com, setCom] = useState('opCOM1')
  const [rtu, setRtu] = useState({ com: '', sId: 0, swapBytes: true, swapWords: true })
  const [tcp, setTcp] = useState({ ip: '', port: 0, sId: 0, swapBytes: true, swapWords: true })

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

  const fetchTCP = async () => {
    try {
      const response = await fetch('http://localhost:3000/config');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      if (isSubscribed) setTcp(json['rtuConf']['tcp']);
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

  const onTCPChange = async (values: { ip: any; port: any; sId: any; swapBytes: any; swapWords: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ tcp: { ip: values.ip, port: values.port, sId: values.sId, swapBytes: values.swapBytes, swapWords: values.swapWords, } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
      fetchTCP();
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
    if (formTCP && activeInput.form == 'tcp') {
      formTCP.setFieldsValue({ [activeInput.id]: activeInput.input })
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
    if (formTCP) {
      formTCP.setFieldsValue({ ip: tcp.ip, port: tcp.port, sId: tcp.sId, swapBytes: tcp.swapBytes, swapWords: tcp.swapWords })
    }
  }, [tcp])

  useEffect(() => {
    fetchRTU();
    //fetchTCP();
    return () => { isSubscribed = false }
  }, [])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.com')} extra={<Segmented size='middle' value={com} onChange={(value) => { setCom(value.toString()) }} options={[{ label: 'COM1', value: 'opCOM1', icon: <ApiOutlined />, },
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
                <Input className="narrow" userRights={['admin', 'manager']} token={token} placeholder='com.path' style={{ width: '100%' }} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'path', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} />
              </Form.Item>
              <Form.Item
                name="scan"
                label={t('com.scan')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber className="narrow" eng tag={{ name: 'comTime' }} userRights={['admin', 'manager']} token={token} placeholder='com.scan' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'scan', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item
                name="timeout"
                label={t('com.timeout')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber className="narrow" eng tag={{ name: 'comTime' }} userRights={['admin', 'manager']} token={token} placeholder='com.timeout' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'com', id: 'timeout', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item
                name="baudRate"
                label={t('com.baudRate')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select userRights={['admin', 'manager']} token={token} options={[{ label: 9600, value: 9600 }, { label: 19200, value: 19200 }, { label: 38400, value: 38400 }, { label: 57600, value: 57600 }, { label: 115200, value: 115200 }, { label: 230400, value: 230400 },]
                }>
                </Select>
              </Form.Item>
              <Form.Item
                name="dataBits"
                label={t('com.dataBits')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select userRights={['admin', 'manager']} token={token} options={[{ label: 5, value: 5 }, { label: 6, value: 6 }, { label: 7, value: 7 }, { label: 8, value: 8 }]} />
              </Form.Item>
              <Form.Item
                name="stopBits"
                label={t('com.stopBits')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select userRights={['admin', 'manager']} token={token} options={[{ label: 1, value: 1 }, { label: 1.5, value: 1.5 }, { label: 2, value: 2 }]} />
              </Form.Item>
              <Form.Item
                name="parity"
                label={t('com.parity.parity')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <Select userRights={['admin', 'manager']} token={token} options={[{ label: t('com.parity.none'), value: "none" }, { label: t('com.parity.even'), value: "even" }, { label: t('com.parity.mark'), value: "mark" }, { label: t('com.parity.odd'), value: "odd" }, { label: t('com.parity.space'), value: "space" }]} />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', flex: '1 1 100%', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.rtu')} bordered={false} size='small' style={cardStyle2} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form
              size='small'
              form={formRTU}
              style={{ width: '100%' }}
              onFinish={onRTUChange}
              preserve={false}
              colon={false}
            >
              <Form.Item label=" " style={{ marginBottom: '0 !important' }}>
                <Form.Item
                  name="com"
                  label={t('rtu.com')}
                  style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <Select userRights={['admin', 'manager']} token={token} options={[{ label: "COM1", value: "opCOM1" }, { label: "COM2", value: "opCOM2" }]} />
                </Form.Item>
                <Form.Item
                  name="sId"
                  label={t('rtu.sId')}
                  style={{ display: 'inline-block', width: 'calc(50%)', marginLeft: 8 }}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <InputNumber className="narrow" userRights={['admin', 'manager']} token={token} placeholder='rtu.sId' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'rtu', id: 'sId', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
                </Form.Item>
              </Form.Item>
              <Form.Item label=" " >
                <Form.Item name="swapBytes" style={{ display: 'inline-block', width: 'calc(50% - 8px)' }} valuePropName="checked" >
                  <Checkbox userRights={['admin', 'manager']} token={token} text='rtu.swapBytes' ></Checkbox>
                </Form.Item>
                <Form.Item name="swapWords" style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }} valuePropName="checked" >
                  <Checkbox userRights={['admin', 'manager']} token={token} text='rtu.swapWords'></Checkbox>
                </Form.Item>
              </Form.Item>
              <Form.Item>
                <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
              </Form.Item>
            </Form>
          </Card>
          <Card title={t('panel.tcp')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              size='small'
              form={formTCP}
              disabled
              style={{ width: '100%' }}
              onFinish={onTCPChange}
              preserve={false}
              colon={false}
            >
              <Form.Item
                label={t('tcp.address')}
                required={true}
              >
                <Form.Item name="ip" rules={[{ required: true, message: t('user.fill') }]} style={{ display: 'inline-block', width: 'calc(70% - 8px)' }} >
                  <InputNumber className="narrow" userRights={['admin', 'manager']} token={token} placeholder='tcp.ip' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'tcp', id: 'ip', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                </Form.Item>
                <Form.Item name="port" rules={[{ required: true, message: t('user.fill') }]} style={{ display: 'inline-block', width: 'calc(30% )', marginLeft: '8px' }} >
                  <InputNumber className="narrow" userRights={['admin', 'manager']} token={token} placeholder='tcp.port' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'tcp', id: 'port', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
                </Form.Item>
              </Form.Item>
              <Form.Item
                name="sId"
                label={t('rtu.sId')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <InputNumber className="narrow" userRights={['admin', 'manager']} token={token} placeholder='rtu.sId' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'tcp', id: 'sId', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
              </Form.Item>
              <Form.Item label=" ">
                <Form.Item name="swapBytes" style={{ display: 'inline-block', width: 'calc(50% - 8px)' }} valuePropName="checked" >
                  <Checkbox userRights={['admin', 'manager']} token={token} text='rtu.swapBytes' ></Checkbox>
                </Form.Item>
                <Form.Item name="swapWords" style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px' }} valuePropName="checked" >
                  <Checkbox userRights={['admin', 'manager']} token={token} text='rtu.swapWords'></Checkbox>
                </Form.Item>
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }} >
                <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsDev

import { Card, Col, Form, notification, Row, Select, Skeleton, } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DesktopOutlined, WifiOutlined, GlobalOutlined, CalendarOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { DatePicker, TimePicker, Button, InputNumber, } from '../components';
import format from 'dayjs';
import dayjs from 'dayjs';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }
const { Option } = Select;

type Props = {
  token: any;
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};

const SettingsOp: React.FC<Props> = ({
  token,
  activeInput,
  setActiveInput,
}) => {
  const { t, i18n } = useTranslation();

  const lngChange = async (lang: string) => {
    try {
      i18n.changeLanguage(lang)
      dayjs.locale(lang)
      await fetch('http://localhost:3000/locales/' + lang, {
        method: 'PATCH',
      });
    }
    catch (error) { /*console.log(error);*/ }
  }

  const [form] = Form.useForm()
  const [formIP] = Form.useForm()
  const [opIP, setOpIP] = useState({ name: '', type: '', ip_address: '', netmask: '', gateway_ip: '', mac_address: '' })
  const [lngs, setLngs] = useState({ data: [] })
  const [today, setDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

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

  const fetchLngs = async () => {
    try {
      const response = await fetch('http://localhost:3000/locales');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setLngs({ data: json }); setLoading(false);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchIP = async () => {
    try {
      const response = await fetch('http://localhost:3000/config');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setOpIP(json['ipConf']['opIP']);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const curDate = today.toLocaleDateString(i18n.language == 'en' ? 'en-GB' : i18n.language, { dateStyle: 'full' });
  const curTime = `${today.toLocaleTimeString(i18n.language == 'en' ? 'en-GB' : i18n.language, { timeStyle: 'full' })}\n\n`;

  const clock = () => {
    setDate(new Date());
    const timer = setInterval(() => { // Creates an interval which will update the current data every minute
      // This will trigger a rerender every component that uses the useDate hook.
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }

  const onReboot = async () => {
    try {
      const response = await fetch('http://localhost:3000/reboot', {
        method: 'POST',
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
    }
    catch (error) { console.log(error) }
  }

  const onIPChange = async (values: { ip: any; mask: any; gw: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ opIP: { ip_address: values.ip, netmask: values.mask, gateway_ip: values.gw } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      fetchIP();
    }
    catch (error) { console.log(error) }
  }


  const onFinish = async (values: { date: any; time: any; }) => {
    try {
      let dt = dayjs(dayjs(values.date).format('L') + " " + dayjs(values.time).format('LTS'))
      const response = await fetch('http://localhost:3000/datetime', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ unix: dt.unix(), iso: dt.toISOString() }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      form.resetFields()
    }
    catch (error) { console.log(error) }
  }

  useEffect(() => {
    (async () => {
      setActiveInput({ ...activeInput, form: '', id: '' });
      await fetchLngs();
      await fetchIP();
      clock();
      dayjs.locale(i18n.language)
    })();
    return () => { }
  }, [])

  useEffect(() => {
    if (formIP && activeInput.form == 'ip') {
      formIP.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    return () => { }
  }, [activeInput])

  useEffect(() => {
    if (formIP) {
      formIP.setFieldsValue({ ip: opIP.ip_address, mask: opIP.netmask, gw: opIP.gateway_ip })
    }
    return () => { }
  }, [opIP])

  useEffect(() => {
    if (form) {
      if (form.getFieldValue('date')) form.setFieldsValue({ date: format(dayjs(form.getFieldValue('date')), 'L') })
      if (form.getFieldValue('time')) form.setFieldsValue({ time: format(form.getFieldValue('time'), 'LTS') })
    }
    return () => { }
  }, [i18n.language])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 30%', marginBottom: 8 }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.language')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
              <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} size='large' style={{ width: '50%' }} colon={false}>
                <Form.Item label={<GlobalOutlined style={{ fontSize: '130%' }} />} >
                  <Select value={i18n.language} onChange={lngChange} >
                    {(lngs.data || []).map(lng => (
                      <Option key={lng['locale']} value={lng['locale']} >
                        <div>{String(lng['locale']).toUpperCase()} - {t('self', { lng: lng['locale'] })}</div></Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Skeleton>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.actions')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
              <Button confirm userRights={['fixer', 'admin', 'manager']} token={token} onClick={onReboot} icon={<ReloadOutlined style={{ fontSize: '200%' }} />} text="system.reboot" />
            </Skeleton>
          </Card>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ flex: '1 1 70%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Skeleton loading={loading} round active>
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                size='large'
                form={formIP}
                style={{ width: '100%' }}
                onFinish={onIPChange}
                preserve={false}
                colon={false}
              >
                <Form.Item label={opIP.type == "Wireless" ? <WifiOutlined style={{ fontSize: '130%' }} /> : <DesktopOutlined style={{ fontSize: '130%' }} />} >
                  <span style={{ fontSize: '16px' }}>{opIP.mac_address + " " + opIP.name + " " + opIP.ip_address + " " + opIP.netmask + " " + opIP.gateway_ip}</span>
                </Form.Item>
                <Form.Item
                  name="ip"
                  label={t('ip.ip')}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <InputNumber userRights={['admin', 'manager']} token={token} placeholder='ip.ip' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'ip', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                </Form.Item>
                <Form.Item
                  name="mask"
                  label={t('ip.mask')}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <InputNumber userRights={['admin', 'manager']} token={token} placeholder='ip.mask' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'mask', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                </Form.Item>
                <Form.Item
                  name="gw"
                  label={t('ip.gw')}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <InputNumber userRights={['admin', 'manager']} token={token} placeholder='ip.gw' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'gw', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
                </Form.Item>
              </Form>
            </Skeleton>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('time.title')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
            <Skeleton loading={loading} round active>
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                size='large'
                style={{ width: '100%' }}
                form={form}
                onFinish={onFinish}
                preserve={false}
                colon={false}
              >
                <Form.Item label={<CalendarOutlined style={{ fontSize: '130%' }} />} >
                  <span style={{ fontSize: '16px' }}>{curDate}</span>
                </Form.Item>
                <Form.Item label={<ClockCircleOutlined style={{ fontSize: '130%' }} />} >
                  <span style={{ fontSize: '16px' }}>{curTime}</span>
                </Form.Item>
                <Form.Item
                  name="date"
                  label={t('time.date')}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <DatePicker userRights={['admin', 'manager']} token={token} />
                </Form.Item>

                <Form.Item
                  name="time"
                  label={t('time.time')}
                  rules={[{ required: true, message: t('user.fill') }]}
                >
                  <TimePicker userRights={['admin', 'manager']} token={token} />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="time.submit" />
                </Form.Item>
              </Form>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsOp

import { Card, Carousel, Col, Form, notification, Row, Segmented, Select, Skeleton, } from 'antd';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { DesktopOutlined, WifiOutlined, GlobalOutlined, CalendarOutlined, ReloadOutlined, PartitionOutlined, ConsoleSqlOutlined, LockOutlined } from '@ant-design/icons';
import { DatePicker, TimePicker, Button, InputNumber, TimeZone, Checkbox, Input, InputPassword, } from '../components';
import format from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { CarouselRef } from 'antd/lib/carousel';
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
      dayjs.locale(lang == 'en' ? 'en-gb' : lang)
      await fetch('http://localhost:3000/locales/' + lang, {
        method: 'PATCH',
      });
    }
    catch (error) { /*console.log(error);*/ }
  }
  const [height, setHeight] = useState<number | undefined>(0)
  const [slide, setSlide] = useState(0);
  const slider = useRef<CarouselRef | null>();
  const [form] = Form.useForm()
  const [formIP] = Form.useForm()
  const [formWifi] = Form.useForm()
  const [formNet] = Form.useForm()

  const [opIP, setOpIP] = useState({ name: '', wired: { dhcp: false, netmask: '', gateway_ip: '', ip_address: '', mac_address: '' }, wireless: { dhcp: false, netmask: '', gateway_ip: '', ip_address: '', mac_address: '' }, wifi: { ssid: '', pwd: '' } })
  const [lngs, setLngs] = useState({ data: [] })
  const [today, setDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [netLoading, setNetLoading] = useState(false)
  const [sync, setSync] = useState(false)
  const [ntp, setNtp] = useState('')
  const [selectedTimezone, setSelectedTimezone] = useState({ value: Intl.DateTimeFormat().resolvedOptions().timeZone } as any)
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };

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
      setLngs({ data: json });
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchSync = async () => {
    try {
      const response = await fetch('http://localhost:3000/datetime');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setSync(json.sync);
      setNtp(json.server);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const getIP = async () => {
    try {
      const response = await fetch('http://localhost:3000/config/getinterfaces');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      await response.json();
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchIP = async () => {
    try {
      const response = await fetch('http://localhost:3000/config');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setOpIP(json['ipConf']['opIP']);
      setLoading(false);
      setNetLoading(false);
      slider.current?.goTo(slide);
    }
    catch (error) { /*console.log(error);*/setLoading(false); setNetLoading(false); }
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

  const onIPChange = async (values: { dhcp: any; ip: any; mask: any; gw: any; }) => {
    setNetLoading(true);
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ opIP: { wired: { dhcp: values.dhcp, ip_address: values.ip, netmask: values.mask, gateway_ip: values.gw } } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      await fetchIP();
    }
    catch (error) { console.log(error) }
  }

  const onWifiChange = async (values: { dhcp: any; ip: any; mask: any; gw: any; ssid: any; pwd: any; }) => {
    setNetLoading(true);
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ opIP: { wifi: { ssid: values.ssid, pwd: values.pwd }, wireless: { dhcp: values.dhcp, ip_address: values.ip, netmask: values.mask, gateway_ip: values.gw } } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      await fetchIP();
    }
    catch (error) { console.log(error) }
  }

  const onNetChange = async (values: { name: any; }) => {
    setNetLoading(true);
    try {
      const response = await fetch('http://localhost:3000/config/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ opIP: { name: values.name } }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      await fetchIP();
    }
    catch (error) { console.log(error) }
  }

  const onFinish = async (values: { date: any; time: any; sync: any; ntp: any; }) => {
    try {
      let dt = dayjs(dayjs(values.time).date(dayjs(values.date).get('date')).month(dayjs(values.date).get('month')).year(dayjs(values.date).get('year')))
      const response = await fetch('http://localhost:3000/datetime', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ unix: dt.unix(), iso: dt.toISOString(), sync: values.sync, tz: selectedTimezone.value || selectedTimezone, ntp: values.ntp || ntp }),
      });
      const json = await response.json();
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      await fetchSync();
    }
    catch (error) { console.log(error) }
  }

  useEffect(() => {
    (async () => {
      if (slide == 0) await fetchIP();
      slider.current?.goTo(slide);
    })();
    return () => { }
  }, [slide])

  useEffect(() => {
    (async () => {
      setActiveInput({ ...activeInput, form: '', id: '' });
      await getIP();
      await fetchLngs();
      await fetchSync();
      await fetchIP();
      clock();
      dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
      setHeight(div.current?.offsetHeight ? div.current?.offsetHeight - 5 : 0)
    })();
    return () => { }
  }, [])

  useEffect(() => {
    if (formIP && activeInput.form == 'ip') {
      formIP.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    if (formNet && activeInput.form == 'net') {
      formNet.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    if (formWifi && activeInput.form == 'wifi') {
      formWifi.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    if (form && activeInput.form == 'time') {
      form.setFieldsValue({ [activeInput.id]: activeInput.input })
    }
    return () => { }
  }, [activeInput])

  useEffect(() => {
    if (formIP) {
      formIP.setFieldsValue({ dhcp: opIP.wired.dhcp, ip: opIP.wired.ip_address, mask: opIP.wired.netmask, gw: opIP.wired.gateway_ip });
    }
    if (formNet) {
      formNet.setFieldsValue({ name: opIP.name })
    }
    if (formWifi) {
      formWifi.setFieldsValue({ ssid: opIP.wifi.ssid, pwd: opIP.wifi.pwd, dhcp: opIP.wireless.dhcp, ip: opIP.wireless.ip_address, mask: opIP.wireless.netmask, gw: opIP.wireless.gateway_ip });
    }
    return () => { }
  }, [opIP])

  useEffect(() => {
    dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
    if (form) {
      if (form.getFieldValue('date')) form.setFieldsValue({ date: format(dayjs(form.getFieldValue('date')), 'L') })
      if (form.getFieldValue('time')) form.setFieldsValue({ time: format(form.getFieldValue('time'), 'LTS') })
      form.setFieldsValue({ sync: sync })
      form.setFieldsValue({ ntp: ntp })
    }
    return () => { }
  }, [i18n.language, sync, ntp])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 10%', marginBottom: 8 }}>
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
      <Row gutter={[8, 8]} style={{ flex: '1 1 90%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.network')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} extra=
            {<Segmented onResize={undefined} onResizeCapture={undefined} size='middle' value={slide} onChange={async (value) => { setSlide(Number(value)); }} options={[{ value: 0, icon: <DesktopOutlined />, },
            { value: 1, icon: <PartitionOutlined />, }, { value: 2, icon: <WifiOutlined />, }]} />} >
            <div ref={div} style={{ height: '100%', width: '100%' }}>
              <div style={{ width: '100%' }}>
                <Skeleton loading={loading || netLoading} round active>
                  <Carousel ref={r => { slider.current = r }} dots={false} swipe={false}>
                    <div>
                      <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
                        <Form
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          size='large'
                          form={formNet}
                          style={{ width: '100%' }}
                          onFinish={onNetChange}
                          preserve={false}
                          colon={false}
                        >
                          <Form.Item label={<WifiOutlined style={{ fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}>{opIP.wireless.mac_address + " " + opIP.wireless.ip_address + " " + opIP.wireless.netmask + " " + opIP.wireless.gateway_ip}</span>
                          </Form.Item>
                          <Form.Item label={<PartitionOutlined style={{ fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}>{opIP.wired.mac_address + " " + opIP.wired.ip_address + " " + opIP.wired.netmask + " " + opIP.wired.gateway_ip}</span>
                          </Form.Item>
                          <Form.Item name="name" label={t('ip.name')} rules={[{ required: true, message: t('user.fill') }]} >
                            <Input userRights={['admin', 'manager']} token={token} className="narrow" placeholder={t('ip.name')} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'net', id: 'name', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'email' }) }} />
                          </Form.Item>
                          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                    <div>
                      <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
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
                          <Form.Item name="dhcp" valuePropName="checked" label={t('ip.dhcp')}>
                            <Checkbox userRights={['admin', 'manager']} token={token} text=''></Checkbox>
                          </Form.Item>
                          <Form.Item
                            name="ip"
                            label={t('ip.ip')}
                          >
                            <InputNumber disable={formIP.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.ip' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'ip', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item
                            name="mask"
                            label={t('ip.mask')}
                          >
                            <InputNumber disable={formIP.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.mask' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'mask', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item
                            name="gw"
                            label={t('ip.gw')}
                          >
                            <InputNumber disable={formIP.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.gw' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'ip', id: 'gw', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                    <div>
                      <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
                        <Form
                          labelCol={{ span: 8 }}
                          wrapperCol={{ span: 16 }}
                          size='large'
                          form={formWifi}
                          style={{ width: '100%' }}
                          onFinish={onWifiChange}
                          preserve={false}
                          colon={false}
                        >
                          <Form.Item name="ssid" label={t('ip.ssid')} >
                            <Input userRights={['admin', 'manager']} token={token} className="narrow" placeholder={t('ip.ssid')} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'wifi', id: 'ssid', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} />
                          </Form.Item>
                          <Form.Item
                            label={t('user.password')}
                            name="pwd"
                          >
                            <InputPassword userRights={['admin', 'manager']} token={token} onChange={(e: { target: { value: any; }; }) => { setActiveInput({ ...activeInput, input: e.target.value }); }} onFocus={(e: { target: { value: any; placeholder: any; }; }) => { setActiveInput({ showKeyboard: true, form: 'wifi', id: 'pwd', num: false, showInput: false, input: e.target.value, descr: e.target.placeholder, pattern: 'default' }) }} visibilityToggle={true} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                          </Form.Item>
                          <Form.Item name="dhcp" valuePropName="checked" label={t('ip.dhcp')}>
                            <Checkbox userRights={['admin', 'manager']} token={token} text=''></Checkbox>
                          </Form.Item>
                          <Form.Item
                            name="ip"
                            label={t('ip.ip')}
                          >
                            <InputNumber disable={formWifi.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.ip' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'wifi', id: 'ip', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item
                            name="mask"
                            label={t('ip.mask')}
                          >
                            <InputNumber disable={formWifi.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.mask' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'wifi', id: 'mask', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item
                            name="gw"
                            label={t('ip.gw')}
                          >
                            <InputNumber disable={formWifi.getFieldValue('dhcp')} userRights={['admin', 'manager']} token={token} placeholder='ip.gw' controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'wifi', id: 'gw', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'ip' }) }} />
                          </Form.Item>
                          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="user.submit" />
                          </Form.Item>
                        </Form>
                      </div>
                    </div>
                  </Carousel>
                </Skeleton>
              </div>
            </div>
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
                  <span style={{ fontSize: '16px' }}>{curDate}</span><br></br><span style={{ fontSize: '16px' }}>{curTime}</span>
                </Form.Item>
                <Form.Item label={t('time.ntp')}  >
                  <Form.Item name="sync" style={{ display: 'inline-block', width: 'calc(15%)' }} valuePropName="checked" >
                    <Checkbox userRights={['admin', 'manager']} token={token} text=''></Checkbox>
                  </Form.Item>
                  <Form.Item className='form-item-narrow' name="ntp" style={{ display: 'inline-block', width: 'calc(85%)' }} >
                    <Input userRights={['admin', 'manager']} token={token} className="narrow" placeholder={t('time.ntp')} onChange={(e: any) => { setActiveInput({ ...activeInput, input: e.target.value }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'time', id: 'ntp', num: false, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'email' }) }} />
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  name="timezone"
                  label={t('time.timezone')}
                >
                  <TimeZone userRights={['admin', 'manager']} token={token}
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                  />
                </Form.Item>
                <Form.Item
                  name="date"
                  label={t('time.date')}
                >
                  <DatePicker userRights={['admin', 'manager']} token={token} />
                </Form.Item>
                <Form.Item
                  name="time"
                  label={t('time.time')}
                >
                  <TimePicker userRights={['admin', 'manager']} token={token} />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }} className='form-item-narrow' >
                  <Button userRights={['admin', 'manager']} token={token} htmlType="submit" text="time.submit" />
                </Form.Item>
              </Form>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div >
  )
}

export default SettingsOp

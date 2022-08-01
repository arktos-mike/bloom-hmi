import { Button, Card, Col, DatePicker, Form, notification, Row, Select, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { GlobalOutlined, CalendarOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }
const { Option } = Select;

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();

  const lngChange = async (lang: string) => {
    try {
      i18n.changeLanguage(lang)
      await fetch('http://localhost:3000/locales/' + lang, {
        method: 'PATCH',
      });
    }
    catch (error) { console.log(error); }
  }

  const [form] = Form.useForm()
  const [lngs, setLngs] = useState({ data: [] })
  const [today, setDate] = useState(new Date())

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
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setLngs({ data: json });
    }
    catch (error) { console.log(error); }
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
      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
    }
    catch (error) { console.log(error) }
  }

  const onFinish = async (values: { date: any; time: any; }) => {
    try {
      const response = await fetch('http://localhost:3000/datetime', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ dt: values.date }),
      });
      const json = await response.json();

      openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
      if (!response.ok) { throw Error(response.statusText); }
      form.resetFields()
    }
    catch (error) { console.log(error) }
  }

  useEffect(() => {
    fetchLngs();
    clock();
  }, [])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 30%', marginBottom: 8 }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.language')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
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
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.actions')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
          <Button type="primary" size='large' onClick={onReboot} icon={<SyncOutlined style={{ fontSize: '200%' }} />}>{t('system.reboot')}</Button>
          </Card>
        </Col>
      </Row>
      <Row gutter={[8, 8]} style={{ flex: '1 1 70%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.tension')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Row style={{ flex: 1, width: '100%' }}>
              <Col span={12}>
              </Col>
              <Col span={12}>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('time.title')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
            <Form
              name="time"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              size='large'
              style={{ width: '100%' }}
              form={form}
              onFinish={onFinish}
              preserve={false}
            >
              <Form.Item label={<CalendarOutlined style={{ fontSize: '130%' }} />} >
                <span style={{fontSize:'20px'}}>{curDate}</span>
              </Form.Item>
              <Form.Item label={<ClockCircleOutlined style={{ fontSize: '130%' }} />} >
                <span style={{fontSize:'20px'}}>{curTime}</span>
              </Form.Item>
              <Form.Item
                name="date"
                label={t('time.date')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <DatePicker popupStyle={{ transform: 'scale(1.3)' }} size="small" style={{width: '100%'}} format='L' />
              </Form.Item>

              <Form.Item
                name="time"
                label={t('time.time')}
                rules={[{ required: true, message: t('user.fill') }]}
              >
                <TimePicker popupStyle={{ transform: 'scale(1.3)'}} size="small" style={{width: '100%'}} format={'HH:mm:ss'} />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button size="large" type="primary" htmlType="submit" >
                  {t('time.submit')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Settings
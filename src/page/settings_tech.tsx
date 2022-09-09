import { Card, Col, notification, Row, Select, } from 'antd';
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

const SettingsTech: React.FC<Props> = ({
  token,
  activeInput,
  setActiveInput,
}) => {
  const { t, i18n } = useTranslation();

  let isSubscribed = true;
  const [tags, setTags] = useState({ data: [] })

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

  useEffect(() => {
    fetchTags(['planSpeedMainDrive', 'takeupDiam', 'takeupRatio', 'planClothDensity']);
    return () => { isSubscribed = false }
  }, [])

  useEffect(() => {

  }, [activeInput])

  const getTag = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { obj['tag']['val']=obj['val']; return obj['tag']; }
    else { return null };
  }
  const fetchTags = async (tagNames: string[]) => {
    try {
      const response = await fetch('http://localhost:3000/tags/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ name: tagNames }),
      });
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      (json || []).map((tag: any) => (
        tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec'])));
      setTags({ data: json });
    }
    catch (error) { console.log(error); }
  }

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.setpoints')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <InputNumber className="narrow" eng descr value={activeInput.id == ('speed') && activeInput.input} tag={getTag('planSpeedMainDrive')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planSpeedMainDrive.descr' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'speed', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
            <InputNumber className="narrow" eng descr value={activeInput.id == ('density') && activeInput.input} tag={getTag('planClothDensity')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planClothDensity.descr' style={{ width: '100%' }} controls={false} onChange={(value: any) => { setActiveInput({ ...activeInput, input: value?.toString() }) }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'density', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.equipment')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >

          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsTech

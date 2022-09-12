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
  const [tags, setTags] = useState({ data: [] as any })

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
    setActiveInput({ ...activeInput, form: '', id: '' });
    fetchTags(['planSpeedMainDrive', 'takeupDiam', 'takeupRatio', 'planClothDensity']);
    return () => { isSubscribed = false }
  }, [])

  const getTag = (tagName: string) => {
    let obj = tags.data.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return obj['tag']; }
    else { return null };
  }
  const getTagVal = (tagName: string) => {
    let obj = tags.data.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return Number(obj['val']).toLocaleString(i18n.language); }
    else { return null };
  }
  const setTagVal = async (tagName: string, tagValue: number) => {
    try {
      const newData = tags.data;
      const index = newData.findIndex((o: any) => o['tag']['name'] == tagName);
      if (newData[index] && (newData[index]['val'] != tagValue)) {
        const response = await fetch((newData[index]['tag']['dev'].includes('rtu')) ? 'http://localhost:3000/tags/writeTagRTU' : 'http://localhost:3000/tags/writeTag', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ name: tagName, value: tagValue }),
        });
        if (!response.ok) { throw Error(response.statusText); }
        newData[index]['val'] = tagValue;
        setTags({ data: newData });
      }
    }
    catch (error) { console.log(error); }
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
      json.map((tag: any) => (
        tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec']).toString()
      )
      );
      setTags({ data: json });
    }
    catch (error) { console.log(error); }
  }

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.setpoints')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <InputNumber className="narrow" eng descr value={activeInput.id == ('speed') ? activeInput.input : getTagVal('planSpeedMainDrive')} tag={getTag('planSpeedMainDrive')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planSpeedMainDrive.descr' style={{ width: '100%' }} controls={false} onUpdate={(value: any) => { setTagVal('planSpeedMainDrive', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'speed', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
            <InputNumber className="narrow" eng descr value={activeInput.id == ('density') ? activeInput.input : getTagVal('planClothDensity')} tag={getTag('planClothDensity')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planClothDensity.descr' style={{ width: '100%' }} controls={false} onUpdate={(value: any) => { setTagVal('planClothDensity', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'density', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
          </Card>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.equipment')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
            <InputNumber className="narrow" descr value={activeInput.id == ('ratio') ? activeInput.input : getTagVal('takeupRatio')} tag={getTag('takeupRatio')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.takeupRatio.descr' style={{ width: '100%' }} controls={false} onUpdate={(value: any) => { setTagVal('takeupRatio', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'eqip', id: 'ratio', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'dec+' }) }} />
            <InputNumber className="narrow" eng descr value={activeInput.id == ('diam') ? activeInput.input : getTagVal('takeupDiam')} tag={getTag('takeupDiam')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.takeupDiam.descr' style={{ width: '100%' }} controls={false} onUpdate={(value: any) => { setTagVal('takeupDiam', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'eqip', id: 'diam', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsTech

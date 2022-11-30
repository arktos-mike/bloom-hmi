import { Card, Col, Modal, notification, Row, Skeleton, } from 'antd';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { InputNumber, Options, Display, Button } from '../components';
import { ScissorOutlined, RedoOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'start', flexDirection: 'column' as 'column' }

type Props = {
  token: any;
  tags: any;
  modeCode: { val: Number, updated: any };
  activeInput: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string };
  setActiveInput: (val: { form: string, id: string, num: boolean, showInput: boolean, input: string, showKeyboard: boolean, descr: string, pattern: string }) => void;
};

const SettingsTech: React.FC<Props> = ({
  token,
  tags,
  modeCode,
  activeInput,
  setActiveInput,
}) => {
  const { t, i18n } = useTranslation();

  const turnON = (num: number, i: number) => num | (1 << i - 1)
  const turnOFF = (num: number, i: number) => num & ~(1 << i - 1)
  const flip = (num: number, i: number) => num ^ (1 << i - 1)
  const query = (num: number, i: number) => num & (1 << i - 1)

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString(i18n.language).charAt(2)
    str.split(Number(1.1).toLocaleString(i18n.language).charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  //const [tags, setTags] = useState({ data: [] as any })
  const [loading, setLoading] = useState(false)

  const confirmNullOrder = () => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: async () => {
        try {
          const response = await fetch('http://localhost:3000/logs/clothlogchange', {
            method: 'POST',
            headers: { 'content-type': 'application/json;charset=UTF-8', },
            body: JSON.stringify({ event: 1, meters: localeParseFloat(getTagVal('orderLength')) }),
          });
          await setTagVal('modeControl', turnON(Number(getTagVal('modeControl')), 2));
          const json = await response.json();
          openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
          if (!response.ok) { /*throw Error(response.statusText);*/ }
        }
        catch (error) { /*console.log(error);*/ }
      },
    });
  };

  const confirmFullWarpBeam = () => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: async () => {
        getTagVal('fullWarpBeamLength') && setTagVal('warpBeamLength', localeParseFloat(getTagVal('fullWarpBeamLength') || ''));
        try {
          const response = await fetch('http://localhost:3000/logs/clothlogchange', {
            method: 'POST',
            headers: { 'content-type': 'application/json;charset=UTF-8', },
            body: JSON.stringify({ event: 0, meters: localeParseFloat(getTagVal('fullWarpBeamLength')) }),
          });
          const json = await response.json();
          openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3, '', json.error ? { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' } : { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
          if (!response.ok) { /*throw Error(response.statusText);*/ }
        }
        catch (error) { /*console.log(error);*/ }
      },
    });
  };

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
    return () => { }
  }, [])

  const getTag = (tagName: string) => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return { ...obj['tag'], link: obj['link'] }; }
    else { return null };
  }
  const getTagVal = (tagName: string): string => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) {
      if (tagName == 'warpBeamLength' && modeCode.val == 1) {
        return Number((Number(obj['val']) - (localeParseFloat(getTagVal('picksLastRun')) / (100 * localeParseFloat(getTagVal('planClothDensity')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage')))))).toFixed(obj['tag']['dec'])).toLocaleString(i18n.language);
      }
      else {
        return Number(obj['val']).toLocaleString(i18n.language);
      }
    }
    else { return '' };
  }
  const setTagVal = async (tagName: string, tagValue: number) => {
    try {
      const newData = tags;
      const index = newData.findIndex((o: any) => o['tag']['name'] == tagName);
      if (newData[index] && (newData[index]['link'] == null || newData[index]['link'] == true) && (newData[index]['val'] != tagValue) && (newData[index]['tag']['min'] <= tagValue) && (newData[index]['tag']['max'] >= tagValue)) {
        const response = await fetch((newData[index]['tag']['dev'].includes('rtu') || newData[index]['tag']['dev'].includes('tcp')) ? 'http://localhost:3000/tags/writeTagRTU' : 'http://localhost:3000/tags/writeTag', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ name: tagName, value: tagValue }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
        //newData[index]['val'] = tagValue;
        //setTags({ data: newData });
      }
      else if ((newData[index]['tag']['min'] > tagValue) || (newData[index]['tag']['max'] < tagValue)) {
        openNotificationWithIcon('warning', t('notifications.dataerror'), 3, '', { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' });
      }
    }
    catch (error) { /*console.log(error);*/ }
  }

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
        <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Row style={{ marginBottom: '8px', flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
            <Card title={t('panel.equipment')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
              <Skeleton loading={loading} round active>
                <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                  <Display value={getTagVal('warpBeamLength')} tag={getTag('warpBeamLength')} />
                  <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<RedoOutlined style={{ fontSize: '150%' }} />} size="large" type="primary" style={{ margin: 10 }} onClick={() => { confirmFullWarpBeam() }} ></Button>
                </div>
                <div style={{ marginTop: '15px', width: '75%' }}>
                  <InputNumber className="narrow" eng descr value={activeInput.id == ('warpLength') ? activeInput.input : getTagVal('fullWarpBeamLength')} tag={getTag('fullWarpBeamLength')} userRights={['admin', 'manager']} token={token} placeholder='tags.fullWarpBeamLength.descr' controls={false} onUpdate={(value: any) => { setTagVal('fullWarpBeamLength', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'warp', id: 'warpLength', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
                </div>
              </Skeleton>
            </Card>
          </Row>
          <Row style={{ flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
            <Card title={t('tags.modeControl.descr')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
              <Skeleton loading={loading} round active>
                <Options userRights={['admin', 'manager']} token={token} value={query(Number(getTagVal('modeControl')), 1)} text='tags.modeControl.descr' options={[{ key: 0, text: 'tags.modeControl.0' }, { key: 1, text: 'tags.modeControl.1' }]} onChange={(value: number) => { setTagVal('modeControl', value == 0 ? turnOFF(Number(getTagVal('modeControl')), 1) : turnON(Number(getTagVal('modeControl')), 1)) }}></Options>
                <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                  <Display value={getTagVal('orderLength')} tag={getTag('orderLength')} />
                  <Button userRights={['admin', 'manager']} token={token} shape="circle" icon={<ScissorOutlined style={{ fontSize: '150%' }} />} size="large" type="primary" style={{ margin: 10 }} onClick={() => { query(Number(getTagVal('modeControl')), 1) && confirmNullOrder() }} ></Button>
                </div>
                <div style={{ marginTop: '15px', width: '75%' }}>
                  <InputNumber className="narrow" eng descr value={activeInput.id == ('orderLength') ? activeInput.input : getTagVal('planOrderLength')} tag={getTag('planOrderLength')} userRights={['admin', 'manager']} token={token} placeholder='tags.planOrderLength.descr' controls={false} onUpdate={(value: any) => { setTagVal('planOrderLength', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'orderLength', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
                </div>
              </Skeleton>
            </Card>
          </Row>
        </Col>
        <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.setpoints')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
            <Skeleton loading={loading} round active>
              <div style={{ marginTop: '15px', width: '75%' }}>
                <InputNumber className="narrow" eng descr value={activeInput.id == ('speed') ? activeInput.input : getTagVal('planSpeedMainDrive')} tag={getTag('planSpeedMainDrive')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planSpeedMainDrive.descr' controls={false} onUpdate={(value: any) => { setTagVal('planSpeedMainDrive', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'speed', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
              </div>
              <div style={{ marginTop: '15px', width: '75%' }}>
                <InputNumber className="narrow" eng descr value={activeInput.id == ('density') ? activeInput.input : getTagVal('planClothDensity')} tag={getTag('planClothDensity')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.planClothDensity.descr' controls={false} onUpdate={(value: any) => { setTagVal('planClothDensity', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'density', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
              </div>
              <div style={{ marginTop: '15px', width: '75%' }}>
                <InputNumber className="narrow" eng descr value={activeInput.id == ('shrink') ? activeInput.input : getTagVal('warpShrinkage')} tag={getTag('warpShrinkage')} userRights={['admin', 'manager', 'fixer']} token={token} placeholder='tags.warpShrinkage.descr' controls={false} onUpdate={(value: any) => { setTagVal('warpShrinkage', value); }} onFocus={(e: any) => { setActiveInput({ showKeyboard: true, form: 'plan', id: 'shrink', num: true, showInput: true, input: e.target.value, descr: e.target.placeholder, pattern: 'float' }) }} />
              </div>
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsTech

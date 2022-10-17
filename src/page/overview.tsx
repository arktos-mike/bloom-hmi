import { Display } from '@/components';
import { Card, Carousel, Col, Row } from 'antd';
import { DashboardOutlined, AimOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }


type Props = {
  token: any;
  modeCode: { val: Number, updated: any };
};

const Overview: React.FC<Props> = ({
  token,
  modeCode,
}) => {
  const { t, i18n } = useTranslation();
  const [height, setHeight] = useState<number | undefined>(0)
  const [tags, setTags] = useState({ data: [] as any })

  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  const dotsClass = { marginTop: '-15px' };
  let isSubscribed = true;

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString().charAt(2)
    str.split(Number(1.1).toLocaleString().charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags');
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
  const getTag = (tagName: string) => {
    let obj = tags.data.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return obj['tag']; }
    else { return null };
  }
  const getTagVal = (tagName: string): string => {
    let obj = tags.data.find((o: any) => o['tag']['name'] == tagName)
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

  useEffect(() => {
    fetchTags()
    return () => { isSubscribed = false }
  }, [tags])

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)

  }, [])

  useEffect(()=>{
    dayjs.locale(i18n.language)
  }, [i18n.language])

  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition='top'>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>
              <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Row style={{ marginBottom: '8px', flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.main')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Display value={getTagVal('planClothDensity')} tag={getTag('planClothDensity')} />
                        <Display value={getTagVal('planSpeedMainDrive')} tag={getTag('planSpeedMainDrive')} />
                        <Display value={getTagVal('warpShrinkage')} tag={getTag('warpShrinkage')} />
                      </div>
                      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Display value={getTagVal(modeCode.val == 1 ? 'speedMainDrive' : 'stopAngle')} tag={getTag(modeCode.val == 1 ? 'speedMainDrive' : 'stopAngle')} icon={modeCode.val == 1 ? <DashboardOutlined style={{ color: '#1890ff' }} /> : <AimOutlined style={{ color: '#1890ff' }} />} />
                      </div>
                    </Card>
                  </Row>
                  <Row style={{ flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.warpbeam')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                        <Display value={getTagVal('warpBeamLength')} suffix={getTagVal('fullWarpBeamLength')}  tag={getTag('warpBeamLength')} />
                        <Display value={getTagVal('orderLength')} suffix={getTagVal('planOrderLength')}  tag={getTag('orderLength')} />
                      </div>
                    </Card>
                  </Row>
                </Col>
                <Col span={12} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Card title={t('panel.setpoints')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle} >
                  </Card>
                </Col>
              </Row>
            </div></div></div>
        <div>
          <div style={contentStyle}>
            <h1>{t('menu.overview')}</h1>
            <div >
              <ol>
                {
                  (tags.data || []).map((tag: any) => (
                    <li key={tag['tag']['name']} style={{ textAlign: 'start' }}>
                      <code>{['modeCode', 'modeControl'].includes(tag['tag']['name']) ? t('tags.modeControl.descr') : t('tags.' + tag['tag']['name'] + '.descr')}</code>&emsp;<b>{getTagVal(tag['tag']['name']) + ' ' + (['modeCode', 'modeControl'].includes(tag['tag']['name']) ? '' : t('tags.' + tag['tag']['name'] + '.eng'))}</b>&emsp;{dayjs(tag['updated']).format('L LTS.SSS')}
                    </li>
                  ))
                }
              </ol>
            </div>
          </div>
        </div>
      </Carousel >
    </div>
  )
}

export default Overview

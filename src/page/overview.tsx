import { Display } from '@/components';
import { Card, Carousel, Col, Row } from 'antd';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'start', flexDirection: 'column' as 'column' }


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

  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition ='top' dots={{className: 'dotsClass'}}>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>
              <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Row style={{ marginBottom: '8px', flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.equipment')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                        <Display value={getTagVal('warpBeamLength')} tag={getTag('warpBeamLength')} />
                      </div>
                    </Card>
                  </Row>
                  <Row style={{ flex: '1 1 50%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('tags.modeControl.descr')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                        <Display value={getTagVal('orderLength')} tag={getTag('orderLength')} />
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
                      <code>{tag['tag']['name']}</code>&emsp;<b>{getTagVal(tag['tag']['name'])}</b>&emsp;{new Date(tag['updated']).toLocaleDateString(i18n.language, {
                        year: 'numeric', month: 'numeric', day: 'numeric',
                        hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3,
                        hour12: false
                      })}
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

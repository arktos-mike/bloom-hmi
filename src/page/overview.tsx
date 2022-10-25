import { Display, Donut } from '@/components';
import { Badge, Card, Carousel, Col, Descriptions, Form, Row, Skeleton, Space } from 'antd';
import { ToolOutlined, QuestionCircleOutlined, LoginOutlined, IdcardOutlined, RiseOutlined, PieChartOutlined, SyncOutlined, ClockCircleOutlined, ScheduleOutlined, DashboardOutlined, AimOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { FabricFullIcon, ButtonIcon, WeftIcon, FabricPieceIcon, FabricPieceLengthIcon, WarpBeamIcon, WarpBeamsIcon } from '@/components/Icons';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

type Props = {
  shadowUser: any;
  shift: any;
  token: any;
  modeCode: { val: Number, updated: any };
};

const Overview: React.FC<Props> = ({
  shadowUser,
  shift,
  token,
  modeCode,
}) => {
  const [formShift] = Form.useForm();
  const [formWeaver] = Form.useForm();
  const { t, i18n } = useTranslation();
  const [height, setHeight] = useState<number | undefined>(0)
  const [tags, setTags] = useState({ data: [] as any })
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState()
  const [userDonut, setUserDonut] = useState([] as any)
  const [userDonutSel, setUserDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: false, button: false, warp: true, weft: true, tool: true, fabric: false } as any)
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  let isSubscribed = true;

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopObj = (reason: string, enable: boolean) => {
    let obj;
    if (reason == 'other') { obj = { color: enable ? '#000000FF' : '#8c8c8c', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: enable ? '#000000FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: enable ? '#7339ABFF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '130%', color: enable ? '#7339ABFF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: enable ? '#FF7F27FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '130%', color: enable ? '#FF7F27FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: enable ? '#FFB300FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '130%', color: enable ? '#FFB300FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: enable ? '#E53935FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '130%', color: enable ? '#E53935FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: enable ? '#005498FF' : '#8c8c8c', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '130%', color: enable ? '#005498FF' : '#8c8c8c', paddingInline: 5 }} /> } }
    else { obj = { color: enable ? '#00000000' : '#8c8c8c', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: enable ? '#00000000' : '#8c8c8c', paddingInline: 5 }} /> } }
    return obj;
  }

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString().charAt(2)
    str.split(Number(1.1).toLocaleString().charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  const fetchUserStatInfo = async () => {
    try {
      const response = await fetch('http://localhost:3000/shifts/getuserstatinfo', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ id: ((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id : shadowUser.id), start: shadowUser.logintime, end: dayjs() }),
      });
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setUserInfo(json[0]);
      if (json[0] && Array.isArray(json[0]['stops'])) {
        let obj = []
        obj.push({ reason: 'run', value: dayjs.duration(json[0]['runtime']).asMilliseconds(), count: Number(json[0]['starts']) })
        for (let stop of json[0]['stops']) {
          obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
        }
        setUserDonut(obj);
      }
      setLoading(false)
    }
    catch (error) { console.log(error); }
  };

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
    if (obj) { return { ...obj['tag'], link: obj['link'] }; }
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
    fetchTags();
    fetchUserStatInfo();
    return () => { isSubscribed = false }
  }, [tags])

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    fetchUserStatInfo();
  }, [])

  useEffect(() => {
    let obj = []
    if (Array.isArray(shift['stops'])) {
      obj.push({ reason: 'run', value: dayjs.duration(shift['runtime']).asMilliseconds(), count: Number(shift['starts']) })
      for (let stop of shift['stops']) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setShiftDonut(obj);
    }
  }, [shift])

  useEffect(() => {
    dayjs.locale(i18n.language)
  }, [i18n.language])


  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition='top'>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>
              <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                <Col span={((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) || shift.name ? 12 : 24} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Row style={{ marginBottom: '8px', flex: '1 1 40%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.main')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal('planClothDensity')} tag={getTag('planClothDensity')} />
                          <Display value={getTagVal('planSpeedMainDrive')} tag={getTag('planSpeedMainDrive')} />
                          <Display value={getTagVal('warpShrinkage')} tag={getTag('warpShrinkage')} />
                        </div>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal(modeCode.val == 1 ? 'speedMainDrive' : 'stopAngle')} tag={getTag(modeCode.val == 1 ? 'speedMainDrive' : 'stopAngle')} icon={modeCode.val == 1 ? <DashboardOutlined style={{ color: '#1890ff' }} /> : <AimOutlined style={{ color: '#1890ff' }} />} />
                        </div>
                      </Skeleton>
                    </Card>
                  </Row>
                  <Row style={{ marginBottom: '8px', flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.warpbeam')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal('warpBeamLength')} suffix={getTagVal('fullWarpBeamLength')} tag={getTag('warpBeamLength')} icon={<WarpBeamsIcon style={{ color: '#1890ff', fontSize: '140%' }} />} />
                        </div>
                      </Skeleton>
                    </Card>
                  </Row>
                  <Row style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex', marginBottom: '2px' }}>
                    <Card title={t('panel.roll')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal('orderLength')} suffix={getTagVal('planOrderLength')} tag={getTag('orderLength')} icon={<FabricPieceLengthIcon style={{ color: '#1890ff' }} />} />
                          <Display value={getTagVal('planOrderLength') != '0' ? Math.floor((localeParseFloat(getTagVal('fullWarpBeamLength')) - localeParseFloat(getTagVal('warpBeamLength'))) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage'))) / localeParseFloat(getTagVal('planOrderLength'))) : 0} tag={{ name: 'rollsCount' }} suffix={getTagVal('planOrderLength') != '0' ? Math.floor(localeParseFloat(getTagVal('fullWarpBeamLength')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage'))) / localeParseFloat(getTagVal('planOrderLength'))) : 0} icon={<FabricPieceIcon style={{ color: '#1890ff' }} />} />
                        </div>
                      </Skeleton>
                    </Card>
                  </Row>
                </Col>
                <Col span={((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) || shift.name ? 12 : 0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  {shift['name'] && <Row style={{ marginBottom: '8px', flex: ((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) ? '1 1 50%' : '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('shift.shift')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Form
                            labelCol={{ span: 2 }}
                            wrapperCol={{ span: 22 }}
                            size='small'
                            form={formShift}
                            style={{ width: '80%' }}
                            preserve={false}
                            colon={false}
                          >
                            <Form.Item label={<ScheduleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '24px' }}>{t('shift.shift') + ' ' + shift['name']}</span>
                              </Form.Item>
                              <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }}>
                                <span style={{ fontSize: '24px' }}>{Number(Number(shift['efficiency']).toFixed(shift['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng')}</span>
                              </Form.Item>
                            </Form.Item>
                            <Form.Item label={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{dayjs(shift['start']).format('LL LT') + ' - ' + dayjs(shift['end']).format('LL LT') + ', ' + duration2text(dayjs.duration(shift['duration'])) + ''}</span>
                            </Form.Item>
                            <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ marginBottom: 0 }} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '16px' }}>{Number(shift['picks']) + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(shift['meters']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
                              </Form.Item>
                              <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }} >
                                <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{Number(Number(shift['rpm']).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(shift['mph']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
                              </Form.Item>
                            </Form.Item>
                            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                                {shift['starts'] > 0 && <div onClick={() => setShiftDonutSel({ ...shiftDonutSel, run: !shiftDonutSel.run })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                  count={shift['starts']} overflowCount={999}
                                  style={{ backgroundColor: shiftDonutSel['run'] ? '#52c41aFF' : '#8c8c8c' }}
                                /><SyncOutlined style={{ fontSize: '130%', color: shiftDonutSel['run'] ? '#52c41aFF' : '#8c8c8c', paddingInline: 5 }} />{duration2text(dayjs.duration(shift['runtime']))}</div>}
                                {Array.isArray(shift['stops']) && shift['stops'].map((stop: any) => (
                                  stop[Object.keys(stop)[0]]['total'] > 0 && <div onClick={() => setShiftDonutSel({ ...shiftDonutSel, [Object.keys(stop)[0]]: !shiftDonutSel[Object.keys(stop)[0]] })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                                    style={{ backgroundColor: stopObj(Object.keys(stop)[0], shiftDonutSel[Object.keys(stop)[0]]).color }}
                                  />{stopObj(Object.keys(stop)[0], shiftDonutSel[Object.keys(stop)[0]]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                                }
                              </Space>
                            </Form.Item>
                          </Form>
                          <div style={{ width: '20%', height: height && height / 4 }}>
                            <Donut data={shiftDonut} selected={shiftDonutSel} text={t('shift.shift') + ' ' + shift['name'] + '\n' + (Number(Number(shift['efficiency']).toFixed(shift['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng'))} />
                          </div></div>
                      </Skeleton>
                    </Card>
                  </Row>}
                  {((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) && <Row style={{ flex: shift['name'] ? '1 1 50%' : '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex', marginBottom: '2px', }}>
                    <Card title={t('user.weaver')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Form
                            labelCol={{ span: 2 }}
                            wrapperCol={{ span: 22 }}
                            size='small'
                            form={formWeaver}
                            style={{ width: '80%' }}
                            preserve={false}
                            colon={false}
                          >
                            <Form.Item label={<IdcardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '24px' }}>{token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : shadowUser.name}</span>
                              </Form.Item>
                              <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }}>
                                <span style={{ fontSize: '24px' }}>{userInfo && (Number(Number(userInfo['efficiency']).toFixed(userInfo['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng'))}</span>
                              </Form.Item>
                            </Form.Item>
                            <Form.Item label={<LoginOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{dayjs(shadowUser.logintime).format('LL LTS') + ', ' + (userInfo && duration2text(dayjs.duration(userInfo['workdur'])))}</span>
                            </Form.Item>
                            <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ marginBottom: 0 }} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '16px' }}>{userInfo && (Number(userInfo['picks']) + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(userInfo['meters']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng'))}</span>
                              </Form.Item>
                              <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }} >
                                <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{userInfo && (Number(Number(userInfo['rpm']).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(userInfo['mph']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng'))}</span>
                              </Form.Item>
                            </Form.Item>
                            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              {userInfo && <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                                {userInfo['starts'] > 0 && <div onClick={() => setUserDonutSel({ ...userDonutSel, run: !userDonutSel.run })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                  count={userInfo['starts']} overflowCount={999}
                                  style={{ backgroundColor: userDonutSel['run'] ? '#52c41aFF' : '#8c8c8c' }}
                                /><SyncOutlined style={{ fontSize: '130%', color: userDonutSel['run'] ? '#52c41aFF' : '#8c8c8c', paddingInline: 5 }} />{duration2text(dayjs.duration(userInfo['runtime']))}</div>}
                                {Array.isArray(userInfo['stops']) && (userInfo['stops'] as []).map((stop: any) => (
                                  stop[Object.keys(stop)[0]]['total'] > 0 && <div onClick={() => setUserDonutSel({ ...userDonutSel, [Object.keys(stop)[0]]: !userDonutSel[Object.keys(stop)[0]] })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                                    style={{ backgroundColor: stopObj(Object.keys(stop)[0], userDonutSel[Object.keys(stop)[0]]).color }}
                                  />{stopObj(Object.keys(stop)[0], userDonutSel[Object.keys(stop)[0]]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                                }
                              </Space>}
                            </Form.Item>
                          </Form>
                          <div style={{ width: '20%', height: height && height / 4 }}>
                            <Donut data={userDonut} selected={userDonutSel} text={t('user.weaver') + '\n' + (userInfo && (Number(Number(userInfo['efficiency']).toFixed(userInfo['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng')))} />
                          </div></div>
                      </Skeleton>
                    </Card>
                  </Row>}
                </Col>
              </Row>
            </div></div></div>
        <div>
          <div style={{ ...contentStyle, maxHeight: '100', overflowY: 'auto' }}>
            <div >
              <Skeleton loading={loading} round active>
                <Descriptions column={24} size='small' >
                  {
                    (tags.data || []).map((tag: any) => (
                      <React.Fragment key={tag['tag']['name']}>
                        <Descriptions.Item span={1} contentStyle={{ justifyContent: 'center' }}><Badge status={tag['link'] == null ? 'default' : tag['link'] == true ? 'success' : 'error'} /></Descriptions.Item><Descriptions.Item span={8}>{t('tags.' + tag['tag']['name'] + '.descr')}</Descriptions.Item><Descriptions.Item span={9}><b>{getTagVal(tag['tag']['name'])}</b>&nbsp;{(['modeCode', 'modeControl'].includes(tag['tag']['name']) ? '' : t('tags.' + tag['tag']['name'] + '.eng'))}</Descriptions.Item><Descriptions.Item span={6}>{dayjs(tag['updated']).format('LL LTS.SSS')}</Descriptions.Item>
                      </React.Fragment>
                    ))
                  }
                </Descriptions>
              </Skeleton>
            </div>
          </div>
        </div>
      </Carousel >
    </div >
  )
}

export default Overview

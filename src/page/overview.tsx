import { Display } from '@/components';
import { Badge, Card, Carousel, Col, Form, Row, Skeleton, Space } from 'antd';
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
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };
  const dotsClass = { marginTop: '-15px' };
  let isSubscribed = true;

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopObj = (reason: string) => {
    let obj;
    if (reason == 'other') { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: '#000000FF', paddingInline: 5 }} /> } }
    else if (reason == 'button') { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '130%', color: '#7339ABFF', paddingInline: 5 }} /> } }
    else if (reason == 'warp') { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '130%', color: '#FF7F27FF', paddingInline: 5 }} /> } }
    else if (reason == 'weft') { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '130%', color: '#FFB300FF', paddingInline: 5 }} /> } }
    else if (reason == 'tool') { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '130%', color: '#E53935FF', paddingInline: 5 }} /> } }
    else if (reason == 'fabric') { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '130%', color: '#005498FF', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '130%', color: '#00000000', paddingInline: 5 }} /> } }
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
      setLoading(false)
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
                <Col span={((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) || shift.name ? 12:24} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
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
                  <Row style={{ flex: '1 1 30%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
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
                <Col span={((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) || shift.name ? 12:0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  {shift['name'] && <Row style={{ marginBottom: '8px', flex: ((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) ? '1 1 50%':'1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('shift.shift')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <Form
                          labelCol={{ span: 2 }}
                          wrapperCol={{ span: 22 }}
                          size='small'
                          form={formShift}
                          style={{ width: '100%' }}
                          preserve={false}
                          colon={false}
                        >
                          <Form.Item label={<ScheduleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}><b>{t('shift.shift') + ' ' + shift['name']}</b></span>
                          </Form.Item>
                          <Form.Item label={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{dayjs(shift['start']).format('LL LT') + ' - ' + dayjs(shift['end']).format('LL LT') + ', ' + duration2text(dayjs.duration(shift['duration'])) + ''}</span>
                          </Form.Item>
                          <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '18px', fontWeight: 600 }}>{Number(Number(shift['efficiency']).toFixed(shift['efficiency'] < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng')}</span>
                          </Form.Item>
                          <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}>{shift['picks'] + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(shift['meters']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
                          </Form.Item>
                          <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{Number(Number(shift['rpm']).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(shift['mph']).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
                          </Form.Item>
                          <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                              {shift['starts'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                count={shift['starts']} overflowCount={999}
                                style={{ backgroundColor: '#52c41aff' }}
                              /><SyncOutlined style={{ fontSize: '130%', color: '#52c41aFF', paddingInline: 5 }} />{duration2text(dayjs.duration(shift['runtime']))}</div>}
                              {Array.isArray(shift['stops']) && shift['stops'].map((stop: any) => (
                                stop[Object.keys(stop)[0]]['total'] > 0 && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                  count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                                  style={{ backgroundColor: stopObj(Object.keys(stop)[0]).color }}
                                />{stopObj(Object.keys(stop)[0]).icon}{duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                              }
                            </Space>
                          </Form.Item>
                        </Form>
                      </Skeleton>
                    </Card>
                  </Row>}
                  {((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser.name) && <Row style={{ flex: shift['name'] ? '1 1 50%':'1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('user.weaver')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <Form
                          labelCol={{ span: 2 }}
                          wrapperCol={{ span: 22 }}
                          size='small'
                          form={formWeaver}
                          style={{ width: '100%' }}
                          preserve={false}
                          colon={false}
                        >
                          <Form.Item label={<IdcardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}><b>{token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : shadowUser}</b></span>
                          </Form.Item>
                          <Form.Item label={<LoginOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}>{dayjs(shadowUser.logintime).format('LL LTS')}</span>
                          </Form.Item>
                          <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}></span>
                          </Form.Item>
                          <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}></span>
                          </Form.Item>
                          <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                            <span style={{ fontSize: '16px' }}></span>
                          </Form.Item>
                          <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >

                          </Form.Item>
                        </Form>
                      </Skeleton>
                    </Card>
                  </Row>}
                </Col>
              </Row>
            </div></div></div>
        <div>
          <div style={contentStyle}>
            <h1>{t('menu.overview')}</h1>
            <div >
              <Skeleton loading={loading} round active>
                <ol>
                  {
                    (tags.data || []).map((tag: any) => (
                      <li key={tag['tag']['name']} style={{ textAlign: 'start' }}>
                        <code>{['modeCode', 'modeControl'].includes(tag['tag']['name']) ? t('tags.modeControl.descr') : t('tags.' + tag['tag']['name'] + '.descr')}</code>&emsp;<b>{getTagVal(tag['tag']['name']) + ' ' + (['modeCode', 'modeControl'].includes(tag['tag']['name']) ? '' : t('tags.' + tag['tag']['name'] + '.eng'))}</b>&emsp;{dayjs(tag['updated']).format('L LTS.SSS')}
                      </li>
                    ))
                  }
                </ol>
              </Skeleton>
            </div>
          </div>
        </div>
      </Carousel >
    </div>
  )
}

export default Overview

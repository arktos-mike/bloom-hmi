import { Button, Display, Donut } from '@/components';
import { Alert, Badge, Card, Carousel, Col, Descriptions, Form, Modal, Result, Row, Segmented, Skeleton, Space } from 'antd';
import { CheckOutlined, ToolOutlined, QuestionCircleOutlined, LoginOutlined, IdcardOutlined, RiseOutlined, PieChartOutlined, SyncOutlined, ClockCircleOutlined, ScheduleOutlined, DashboardOutlined, AimOutlined, ExclamationCircleOutlined, HistoryOutlined, ReconciliationOutlined, CalendarOutlined, FieldTimeOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef, memo } from 'react'
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { FabricFullIcon, ButtonIcon, WeftIcon, FabricPieceIcon, FabricPieceLengthIcon, WarpBeamIcon, WarpBeamsIcon } from '@/components/Icons';
import { isEqual } from 'lodash';

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

type Props = {
  shadowUser: any;
  info: any;
  fullinfo: any;
  userinfo: any;
  token: any;
  tags: any;
  pieces: any;
  modeCode: { val: Number, updated: any };
  reminders: any;
  setUpdatedReminders: (val: boolean) => void;
  period: any;
  setPeriod: (val: string) => void;
};

const Overview: React.FC<Props> = memo(({
  shadowUser,
  info,
  fullinfo,
  userinfo,
  token,
  tags,
  pieces,
  modeCode,
  reminders,
  setUpdatedReminders,
  period,
  setPeriod
}) => {
  const [formShift] = Form.useForm();
  const [formWeaver] = Form.useForm();
  const { t, i18n } = useTranslation();
  const [height, setHeight] = useState<number | undefined>(0)
  const [loading, setLoading] = useState(true)
  const [periodInfo, setPeriodInfo] = useState<any>((period == 'day' || ((!fullinfo?.shift?.shiftstart || !fullinfo?.shift?.shiftend) && period == 'shift')) ? { name: dayjs(fullinfo?.dayinfo?.start).format('LL'), start: fullinfo?.dayinfo?.start, end: fullinfo?.dayinfo?.end, duration: '', picks: fullinfo?.dayinfo?.picks, meters: fullinfo?.dayinfo?.meters, rpm: fullinfo?.dayinfo?.rpm, mph: fullinfo?.dayinfo?.mph, efficiency: fullinfo?.dayinfo?.efficiency, starts: fullinfo?.dayinfo?.starts, runtime: fullinfo?.dayinfo?.runtime, stops: fullinfo?.dayinfo?.stops } : (period == 'shift') ? { name: t('shift.shift') + ' ' + fullinfo?.shift?.shiftname, start: fullinfo?.shift?.shiftstart, end: fullinfo?.shift?.shiftend, duration: fullinfo?.shift?.shiftdur, picks: fullinfo?.shiftinfo?.picks, meters: fullinfo?.shiftinfo?.meters, rpm: fullinfo?.shiftinfo?.rpm, mph: fullinfo?.shiftinfo?.mph, efficiency: fullinfo?.shiftinfo?.efficiency, starts: fullinfo?.shiftinfo?.starts, runtime: fullinfo?.shiftinfo?.runtime, stops: fullinfo?.shiftinfo?.stops } : (period == 'month') ? { name: dayjs(fullinfo?.monthinfo?.start).format('MMMM YYYY'), start: fullinfo?.monthinfo?.start, end: fullinfo?.monthinfo?.end, duration: '', picks: fullinfo?.monthinfo?.picks, meters: fullinfo?.monthinfo?.meters, rpm: fullinfo?.monthinfo?.rpm, mph: fullinfo?.monthinfo?.mph, efficiency: fullinfo?.monthinfo?.efficiency, starts: fullinfo?.monthinfo?.starts, runtime: fullinfo?.monthinfo?.runtime, stops: fullinfo?.monthinfo?.stops } : {})
  const [userInfo, setUserInfo] = useState<any>({ name: fullinfo?.weaver?.name, start: fullinfo?.weaver?.logintime, end: fullinfo?.dayinfo?.end, duration: fullinfo?.userinfo?.workdur, picks: fullinfo?.userinfo?.picks, meters: fullinfo?.userinfo?.meters, rpm: fullinfo?.userinfo?.rpm, mph: fullinfo?.userinfo?.mph, efficiency: fullinfo?.userinfo?.efficiency, starts: fullinfo?.userinfo?.starts, runtime: fullinfo?.userinfo?.runtime, stops: fullinfo?.userinfo?.stops })
  const [userDonut, setUserDonut] = useState([] as any)
  const [userDonutSel, setUserDonutSel] = useState({ run: true, other: true, button: true, warp: true, weft: true, tool: true, fabric: true } as any)
  const [shiftDonut, setShiftDonut] = useState([] as any)
  const [shiftDonutSel, setShiftDonutSel] = useState({ run: true, other: false, button: false, warp: true, weft: true, tool: true, fabric: false } as any)
  const div = useRef<HTMLDivElement | null>(null);
  const contentStyle = { height: height, margin: '1px' };

  const duration2text = (diff: any) => {
    if (diff == null) return null
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
  }

  const stopNum = (reason: string) => {
    let obj;
    if (reason == 'other') obj = 0
    else if (reason == 'button') obj = 2
    else if (reason == 'warp') obj = 3
    else if (reason == 'weft') obj = 4
    else if (reason == 'tool') obj = 5
    else if (reason == 'fabric') obj = 6
    return obj;
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  const confirm = (id: any) => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: () => { handleAck(id) },
    });
  };

  const handleAck = async (id: any) => {
    try {
      const response = await fetch('http://localhost:3000/reminders/ack/' + id, {
        method: 'POST',
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      setUpdatedReminders(true);
    }
    catch (error) { /*console.log(error);*/ }
  };

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString().charAt(2)
    str.split(Number(1.1).toLocaleString().charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  const getTag = (tagName: string) => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return { ...obj['tag'], link: obj['link'] }; }
    else { return null };
  }
  const getTagVal = (tagName: string): string => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) {
      if (tagName == 'warpBeamLength' && modeCode?.val == 1) {
        return Number((Number(obj['val']) - (localeParseFloat(getTagVal('picksLastRun')) / (100 * localeParseFloat(getTagVal('planClothDensity')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage')))))).toFixed(obj['tag']['dec'])).toLocaleString(i18n.language);
      }
      else {
        return Number(obj['val']).toLocaleString(i18n.language);
      }
    }
    else { return '' };
  }

  useEffect(() => {
    setHeight(div.current?.offsetHeight ? div.current?.offsetHeight : 0)
    return () => { }
  }, [])

  useEffect(() => {
    if (period == 'day' || ((!fullinfo?.shift?.shiftstart || !fullinfo?.shift?.shiftend) && period == 'shift')) setPeriodInfo({ name: dayjs(fullinfo?.dayinfo?.start).format('LL'), start: fullinfo?.dayinfo?.start, end: fullinfo?.dayinfo?.end, duration: '', picks: fullinfo?.dayinfo?.picks, meters: fullinfo?.dayinfo?.meters, rpm: fullinfo?.dayinfo?.rpm, mph: fullinfo?.dayinfo?.mph, efficiency: fullinfo?.dayinfo?.efficiency, starts: fullinfo?.dayinfo?.starts, runtime: fullinfo?.dayinfo?.runtime, stops: fullinfo?.dayinfo?.stops });
    else if (period == 'shift') setPeriodInfo({ name: t('shift.shift') + ' ' + fullinfo?.shift?.shiftname, start: fullinfo?.shift?.shiftstart, end: fullinfo?.shift?.shiftend, duration: fullinfo?.shift?.shiftdur, picks: fullinfo?.shiftinfo?.picks, meters: fullinfo?.shiftinfo?.meters, rpm: fullinfo?.shiftinfo?.rpm, mph: fullinfo?.shiftinfo?.mph, efficiency: fullinfo?.shiftinfo?.efficiency, starts: fullinfo?.shiftinfo?.starts, runtime: fullinfo?.shiftinfo?.runtime, stops: fullinfo?.shiftinfo?.stops });
    else if (period == 'month') setPeriodInfo({ name: dayjs(fullinfo?.monthinfo?.start).format('MMMM YYYY'), start: fullinfo?.monthinfo?.start, end: fullinfo?.monthinfo?.end, duration: '', picks: fullinfo?.monthinfo?.picks, meters: fullinfo?.monthinfo?.meters, rpm: fullinfo?.monthinfo?.rpm, mph: fullinfo?.monthinfo?.mph, efficiency: fullinfo?.monthinfo?.efficiency, starts: fullinfo?.monthinfo?.starts, runtime: fullinfo?.monthinfo?.runtime, stops: fullinfo?.monthinfo?.stops });
    setUserInfo({ name: fullinfo?.weaver?.name, start: fullinfo?.weaver?.logintime, end: fullinfo?.dayinfo?.end, duration: fullinfo?.userinfo?.workdur, picks: fullinfo?.userinfo?.picks, meters: fullinfo?.userinfo?.meters, rpm: fullinfo?.userinfo?.rpm, mph: fullinfo?.userinfo?.mph, efficiency: fullinfo?.userinfo?.efficiency, starts: fullinfo?.userinfo?.starts, runtime: fullinfo?.userinfo?.runtime, stops: fullinfo?.userinfo?.stops });
  }, [fullinfo, period]);

  useEffect(() => {
    if (period == 'day' || ((!info.shift.shiftstart || !info.shift.shiftend) && period == 'shift')) setPeriodInfo({ ...periodInfo, name: dayjs(info.dayinfo?.start).format('LL'), start: info.dayinfo?.start, end: info.dayinfo?.end, picks: info.dayinfo?.picks, meters: info.dayinfo?.meters, rpm: info.dayinfo?.rpm, mph: info.dayinfo?.mph, efficiency: info.dayinfo?.efficiency });
    else if (period == 'shift') setPeriodInfo({ ...periodInfo, name: t('shift.shift') + ' ' + info.shift?.shiftname, start: info.shift?.shiftstart, end: info.shift?.shiftend, picks: info.shiftinfo?.picks, meters: info.shiftinfo?.meters, rpm: info.shiftinfo?.rpm, mph: info.shiftinfo?.mph, efficiency: info.shiftinfo?.efficiency });
    else if (period == 'month') setPeriodInfo({ ...periodInfo, name: dayjs(info.monthinfo?.start).format('MMMM YYYY'), start: info.monthinfo?.start, end: info.monthinfo?.end, picks: info.monthinfo?.picks, meters: info.monthinfo?.meters, rpm: info.monthinfo?.rpm, mph: info.monthinfo?.mph, efficiency: info.monthinfo?.efficiency });
  }, [info.dayinfo?.end]);

  useEffect(() => {
    setUserInfo({ ...userInfo, name: info.weaver?.name, start: info.weaver?.logintime, end: info.dayinfo?.end, picks: info.userinfo?.picks, meters: info.userinfo?.meters, rpm: info.userinfo?.rpm, mph: info.userinfo?.mph, efficiency: info.userinfo?.efficiency });
  }, [info.userinfo?.efficiency, info.weaver?.id && period, info.weaver?.logintime]);

  useEffect(() => {
    userinfo && setUserInfo({ picks: userinfo?.picks, meters: userinfo?.meters, rpm: userinfo?.rpm, mph: userinfo?.mph, efficiency: userinfo?.efficiency, starts: userinfo?.starts, runtime: userinfo?.runtime, stops: userinfo?.stops });
  }, [userinfo]);

  useEffect(() => {
    if (Array.isArray(periodInfo?.stops)) {
      let obj = []
      obj.push({ reason: 'run', value: dayjs.duration(periodInfo?.runtime || 0).asMilliseconds(), count: Number(periodInfo?.starts) })
      for (let stop of periodInfo?.stops) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setShiftDonut(obj);
    }
    return () => { }
  }, [periodInfo?.runtime, periodInfo?.stops, period])

  useEffect(() => {
    if (userInfo && Array.isArray(userInfo?.stops)) {
      let obj = []
      obj.push({ reason: 'run', value: dayjs.duration(userInfo?.runtime || 0).asMilliseconds(), count: Number(userInfo?.starts) })
      for (let stop of userInfo?.stops) {
        obj.push({ reason: Object.keys(stop)[0], value: dayjs.duration(stop[Object.keys(stop)[0]]['dur']).asMilliseconds(), count: stop[Object.keys(stop)[0]]['total'] })
      }
      setUserDonut(obj);
    }
    setLoading(false)
    return () => { }
  }, [userInfo?.runtime, userInfo?.stops, period])

  useEffect(() => {
    dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
    return () => { }
  }, [i18n.language])

  return (
    <div ref={div} className='wrapper'>
      <Carousel dotPosition='top' swipe={true}>
        <div>
          <div style={contentStyle}>
            <div className='wrapper'>
              <Row gutter={[8, 8]} style={{ flex: '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Row style={{ marginBottom: '8px', flex: '1 1 40%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={t('panel.main')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
                      <Skeleton loading={loading} round active>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal('planClothDensity')} tag={getTag('planClothDensity')} />
                          <Display value={getTagVal('planSpeedMainDrive')} tag={getTag('planSpeedMainDrive')} />
                          <Display value={getTagVal('warpShrinkage')} tag={getTag('warpShrinkage')} />
                        </div>
                        <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                          <Display value={getTagVal(modeCode?.val == 1 ? 'speedMainDrive' : 'stopAngle')} tag={getTag(modeCode?.val == 1 ? 'speedMainDrive' : 'stopAngle')} icon={modeCode?.val == 1 ? <DashboardOutlined style={{ color: '#1890ff' }} /> : <AimOutlined style={{ color: '#1890ff' }} />} />
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
                          <Display value={pieces} tag={{ name: 'rollsCount' }} suffix={getTagVal('planOrderLength') != '0' ? Math.floor(localeParseFloat(getTagVal('warpBeamLength')) * (1 - 0.01 * localeParseFloat(getTagVal('warpShrinkage'))) / localeParseFloat(getTagVal('planOrderLength'))) : 0} icon={<FabricPieceIcon style={{ color: '#1890ff' }} />} />
                        </div>
                      </Skeleton>
                    </Card>
                  </Row>
                </Col>
                <Col span={12} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', alignSelf: 'stretch' }}>
                  <Row style={{ marginBottom: ((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser?.name) ? '8px' : '0px', flex: ((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser?.name) ? '1 1 50%' : '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex' }}>
                    <Card title={capitalizeFirstLetter(t('period.' + period))} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}
                      extra={<Segmented onResize={undefined} onResizeCapture={undefined} size='middle' value={period} onChange={(value) => { setPeriod(value.toString()); }}
                        options={[{ label: t('period.shift'), value: 'shift', icon: <ScheduleOutlined /> },
                        { label: t('period.day'), value: 'day', icon: <HistoryOutlined /> },
                        { label: t('period.month'), value: 'month', icon: <ReconciliationOutlined /> }]} />
                      }>
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
                                <span style={{ fontSize: '24px' }}>{periodInfo?.name}</span>
                              </Form.Item>
                              {periodInfo?.efficiency && <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }}>
                                <span style={{ fontSize: '24px' }}>{Number(Number(periodInfo?.efficiency).toFixed(periodInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng')}</span>
                              </Form.Item>}
                            </Form.Item>
                            <Form.Item label={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{dayjs(periodInfo?.start).format('LL LT') + ' - ' + dayjs(periodInfo?.end).format('LL LT') + (periodInfo?.duration && (', ' + duration2text(dayjs.duration(periodInfo?.duration))))}</span>
                            </Form.Item>
                            {periodInfo?.picks && <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ marginBottom: 0 }} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '16px' }}>{Number(periodInfo?.picks) + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(periodInfo?.meters).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng')}</span>
                              </Form.Item>
                              <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }} >
                                <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{Number(Number(periodInfo?.rpm).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(periodInfo?.mph).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng')}</span>
                              </Form.Item>
                            </Form.Item>}
                            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                                {periodInfo?.starts > 0 && <div onClick={() => setShiftDonutSel({ ...shiftDonutSel, run: !shiftDonutSel.run })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                  count={periodInfo?.starts} overflowCount={999}
                                  style={{ backgroundColor: shiftDonutSel['run'] ? '#52c41aFF' : '#8c8c8c' }}
                                /><SyncOutlined style={{ fontSize: '130%', color: shiftDonutSel['run'] ? '#52c41aFF' : '#8c8c8c', paddingInline: 5 }} />{modeCode?.val == 1 ? duration2text(dayjs.duration(periodInfo?.runtime).add((dayjs(modeCode?.updated).isBefore(dayjs(periodInfo?.start))==true ? dayjs().diff(dayjs(periodInfo?.start)) : dayjs().diff(dayjs(modeCode?.updated))))) : duration2text(dayjs.duration(periodInfo?.runtime))}</div>}
                                {Array.isArray(periodInfo?.stops) && periodInfo?.stops.map((stop: any) => (
                                  stop[Object.keys(stop)[0]]['total'] > 0 && <div onClick={() => setShiftDonutSel({ ...shiftDonutSel, [Object.keys(stop)[0]]: !shiftDonutSel[Object.keys(stop)[0]] })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                                    style={{ backgroundColor: stopObj(Object.keys(stop)[0], shiftDonutSel[Object.keys(stop)[0]]).color }}
                                  />{stopObj(Object.keys(stop)[0], shiftDonutSel[Object.keys(stop)[0]]).icon}{modeCode?.val == stopNum(Object.keys(stop)[0]) ? duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']).add((dayjs(modeCode?.updated).isBefore(dayjs(periodInfo?.start))==true ? dayjs().diff(dayjs(periodInfo?.start)) : dayjs().diff(dayjs(modeCode?.updated))))) : duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                                }
                              </Space>
                            </Form.Item>
                          </Form>
                          <div style={{ width: '20%', height: height && height / 4 }}>
                            <Donut data={shiftDonut} selected={shiftDonutSel} text={periodInfo?.efficiency && (Number(Number(periodInfo?.efficiency).toFixed(periodInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng'))} />
                          </div></div>
                      </Skeleton>
                    </Card>
                  </Row>
                  {((token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver') || shadowUser?.name) && <Row style={{ flex: periodInfo?.name ? '1 1 50%' : '1 1 100%', alignSelf: 'stretch', alignItems: 'stretch', display: 'flex', marginBottom: '2px', }}>
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
                                <span style={{ fontSize: '24px' }}>{userInfo?.name}</span>
                              </Form.Item>
                              {userInfo?.efficiency && <Form.Item label={<RiseOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }}>
                                <span style={{ fontSize: '24px' }}>{userInfo && (Number(Number(userInfo?.efficiency).toFixed(userInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + ' ' + t('tags.efficiency.eng'))}</span>
                              </Form.Item>}
                            </Form.Item>
                            <Form.Item label={<LoginOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{dayjs(userInfo?.start).format('LL LT') + ', ' + (userInfo && duration2text(dayjs.duration(dayjs().diff(dayjs(userInfo.start)))))}</span>
                            </Form.Item>
                            {userInfo?.picks && <Form.Item label={<SyncOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ marginBottom: 0 }} >
                              <Form.Item style={{ display: 'inline-block' }} >
                                <span style={{ fontSize: '16px' }}>{userInfo && (Number(userInfo?.picks) + ' ' + t('tags.picksLastRun.eng') + ', ' + Number(Number(userInfo?.meters).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.clothMeters.eng'))}</span>
                              </Form.Item>
                              <Form.Item label={<DashboardOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} style={{ display: 'inline-block', marginLeft: 15 }} >
                                <span style={{ fontSize: '16px', color: '#8c8c8c' }}>{userInfo && (Number(Number(userInfo?.rpm).toFixed(1)).toLocaleString(i18n.language) + ' ' + t('tags.speedMainDrive.eng') + ', ' + Number(Number(userInfo?.mph).toFixed(2)).toLocaleString(i18n.language) + ' ' + t('tags.speedCloth.eng'))}</span>
                              </Form.Item>
                            </Form.Item>}
                            <Form.Item label={<PieChartOutlined style={{ color: '#1890ff', fontSize: '130%' }} />} >
                              {userInfo && <Space direction="horizontal" style={{ width: '100%', justifyContent: 'start', alignItems: 'start' }} wrap>
                                {userInfo?.starts > 0 && <div onClick={() => setUserDonutSel({ ...userDonutSel, run: !userDonutSel.run })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                  count={userInfo?.starts} overflowCount={999}
                                  style={{ backgroundColor: userDonutSel['run'] ? '#52c41aFF' : '#8c8c8c' }}
                                /><SyncOutlined style={{ fontSize: '130%', color: userDonutSel['run'] ? '#52c41aFF' : '#8c8c8c', paddingInline: 5 }} />{modeCode?.val == 1 ? duration2text(dayjs.duration(userInfo?.runtime).add((dayjs(modeCode?.updated).isBefore(dayjs(userInfo?.start))==true ? dayjs().diff(dayjs(userInfo?.start)) : dayjs().diff(dayjs(modeCode?.updated))))) : duration2text(dayjs.duration(userInfo?.runtime))}</div>}
                                {Array.isArray(userInfo?.stops) && (userInfo?.stops as []).map((stop: any) => (
                                  stop[Object.keys(stop)[0]]['total'] > 0 && <div onClick={() => setUserDonutSel({ ...userDonutSel, [Object.keys(stop)[0]]: !userDonutSel[Object.keys(stop)[0]] })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} key={Object.keys(stop)[0]}><Badge size='small'
                                    count={stop[Object.keys(stop)[0]]['total']} overflowCount={999}
                                    style={{ backgroundColor: stopObj(Object.keys(stop)[0], userDonutSel[Object.keys(stop)[0]]).color }}
                                  />{stopObj(Object.keys(stop)[0], userDonutSel[Object.keys(stop)[0]]).icon}{modeCode?.val == stopNum(Object.keys(stop)[0]) ? duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']).add((dayjs(modeCode?.updated).isBefore(dayjs(userInfo?.start))==true ? dayjs().diff(dayjs(userInfo?.start)) : dayjs().diff(dayjs(modeCode?.updated))))) : duration2text(dayjs.duration(stop[Object.keys(stop)[0]]['dur']))}</div>))
                                }
                              </Space>}
                            </Form.Item>
                          </Form>
                          <div style={{ width: '20%', height: height && height / 4 }}>
                            <Donut data={userDonut} selected={userDonutSel} text={t('user.weaver') + '\n' + (userInfo && (Number(Number(userInfo?.efficiency).toFixed(userInfo?.efficiency < 10 ? 2 : 1)).toLocaleString(i18n.language) + t('tags.efficiency.eng')))} />
                          </div></div>
                      </Skeleton>
                    </Card>
                  </Row>}
                </Col>
              </Row>
            </div></div></div>
        <div>
          <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
            {(reminders || []).length ?
              (reminders || []).map((note: any) => (
                <React.Fragment key={note['id']}>
                  <div style={{ display: 'inline-flex', width: '100%', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
                    <Alert
                      style={{ flexGrow: '1', marginRight: 10 }}
                      message={note['title']}
                      description={note['descr']}
                      type="info"
                    />
                    <Button userRights={['admin', 'manager', 'fixer']} token={token} shape="circle" icon={<CheckOutlined />} size="small" type="primary" style={{ margin: 0, background: "#87d068", borderColor: "#87d068" }} onClick={() => { confirm(note['id']) }} />
                  </div>
                </React.Fragment>
              )) :
              <Result
                status="success"
                title={t('notifications.none')}
                subTitle={t('notifications.descr')}
                style={{ height: '100%', alignItems: 'center' }}
              />
            }
          </div>
        </div>
        {/*
       <div>
          <div style={{ ...contentStyle, maxHeight: '100%', overflowY: 'auto' }}>
            <div >
              <Skeleton loading={loading} round active>
                <Descriptions column={24} size='small' >
                  {
                    tags.map((tag: any) => (
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
         */}
      </Carousel >
    </div >
  )
},
  (pre, next) => {
    return isEqual(pre, next);
  }
);
export default Overview

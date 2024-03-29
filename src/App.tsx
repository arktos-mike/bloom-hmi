import React, { useState, useEffect, useRef } from 'react'
import logo from '/icon.svg'
import 'styles/app.less'
import { Route, Link, Routes, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Input, notification, ConfigProvider, Space, Progress, Avatar, Tooltip, Spin, Badge } from 'antd';
import { BellOutlined, ReconciliationOutlined, TagsOutlined, ReadOutlined, ScheduleOutlined, ToolOutlined, QuestionCircleOutlined, SyncOutlined, LoadingOutlined, AimOutlined, DashboardOutlined, CloseCircleTwoTone, EyeTwoTone, EyeInvisibleOutlined, GlobalOutlined, CloseOutlined, ToTopOutlined, VerticalAlignBottomOutlined, EyeOutlined, TeamOutlined, SettingOutlined, UserOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { ButtonIcon, FabricFullIcon, WarpBeamIcon, WeftIcon } from "./components/Icons"
import { useIdleTimer } from 'react-idle-timer'
import Overview from "./page/overview";
import SettingsOp from "./page/settings_op";
import SettingsDev from "./page/settings_dev";
import Users from "./page/users";
import UserLogin from "./dialog/UserLogin";
import Shifts from "./page/shifts";
import ModeLog from "./page/modelog";
import UserLog from "./page/userlog";
import ClothLog from "./page/clothlog";
import MachineInfo from "./page/machine_info";
import MonthReport from "./page/month_report";
import UserReport from "./page/user_report";

import './i18n/config';
import { useTranslation } from 'react-i18next';
import rulocale from 'antd/lib/locale/ru_RU';
import trlocale from 'antd/lib/locale/tr_TR';
import eslocale from 'antd/lib/locale/es_ES';
import enlocale from 'antd/lib/locale/en_US';

import Keyboard, { KeyboardReactInterface } from 'react-simple-keyboard'
import 'styles/keyboard.css'
import enlayout from "simple-keyboard-layouts/build/layouts/english";
import trlayout from "simple-keyboard-layouts/build/layouts/turkish";
import rulayout from "simple-keyboard-layouts/build/layouts/russian";
import eslayout from "simple-keyboard-layouts/build/layouts/spanish";
import numeric from "./components/numeric";

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
import SettingsTech from './page/settings_tech';
import { Breadcrumb } from './components';
import Reminders from './page/reminders';
dayjs.extend(isBetween);
import { differenceWith, isEqual } from 'lodash-es';

import type { InputRef } from 'antd';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App: React.FC = () => {
  const keyboardRef = useRef<KeyboardReactInterface | null>(null)
  const span = useRef<HTMLSpanElement | null>(null);
  const descr = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<InputRef>(null);
  const location = useLocation();
  const openNotificationWithIcon = (type: string, message: string, dur: number, key?: string, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error') {
      notification[type]({
        key: key,
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
    }
  };

  const checkShadowUser = async () => {
    try {
      const ans = await fetch('http://localhost:3000/logs/user');
      const json = await ans.json();
      if (!ans.ok) { throw Error(ans.statusText); }
      if (json.length && (token && (json[0].id != JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id))) {
        setShadowUser(json[0]);
      }
      else { setShadowUser({ id: null, name: null, logintime: json[0].logintime }) }
    }
    catch (error) { /*console.log(error);*/ }
  }

  const checkLogin = async () => {
    try {
      const ans = await fetch('http://localhost:3000/logs/user');
      const json = await ans.json();
      if (!ans.ok) { throw Error(ans.statusText); }
      if (json.length) {
        const response = await fetch('http://localhost:3000/users/login/' + json[0].id, {
          method: 'POST'
        });
        const jsonb = await response.json();
        setToken(jsonb.token || null);
        if (!response.ok) { /*throw Error(response.statusText);*/ }
      }
      else { setToken(null); }
    }
    catch (error) { /*console.log(error);*/ }
  }

  const onIdle = async () => {
    if (!remember && token) {
      await checkLogin();
      openNotificationWithIcon('warning', t('notifications.idle'), 0, '0', '', { backgroundColor: '#fffbe6', border: '2px solid #ffe58f' });
    }
  }

  const idleTimer = useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 5,
    debounce: 250
  })

  const { t, i18n } = useTranslation();

  const [inputWidth, setInputWidth] = useState<number | undefined>(0)
  const [modeCode, setModeCode] = useState({ val: 0, updated: {} });
  const [activeInput, setActiveInput] = useState({ form: '', id: '', num: false, showInput: true, input: '', showKeyboard: false, descr: '', pattern: 'default' })
  const [keyboardLayout, setKeyboardLayout] = useState(enlayout.layout)
  const [keyboardLng, setKeyboardLng] = useState('en')
  const [keyboardCollapse, setKeyboardCollapse] = useState(false)
  const [bufferKeyboard, setBufferKeyboard] = useState('')
  const [bufferTemp, setBufferTemp] = useState('')
  const [lngs, setLngs] = useState({ data: [] })
  const [token, setToken] = useState<string | null>(null)
  const [shadowUser, setShadowUser] = useState({ id: null, name: null, logintime: null })
  const [remember, setRemember] = useState(true)
  const [control, setControl] = useState(false)
  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [userDialogVisible, setUserDialogVisible] = useState(false)
  const [layout, setLayout] = useState('default')
  const [tags, setTags] = useState({ data: [] })
  const [shift, setShift] = useState({ name: '', start: '', end: '', duration: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: '', stops: {} })
  const [updated, setUpdated] = useState(false)
  const [updatedReminders, setUpdatedReminders] = useState(false)
  const [openKeys, setOpenKeys] = useState(['']);
  const [reminders, setReminders] = useState()
  const [remindersFilter, setRemindersFilter] = useState<any[]>()

  const handleShift = () => {
    setLayout(layout === "default" ? "shift" : "default")
  };

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") handleShift();
    if (button === "{enter}") { setActiveInput({ ...activeInput, input: bufferKeyboard, showKeyboard: false }); }
    if (['default', 'float', 'dec-'].includes(activeInput.pattern) && activeInput.num && button === "-") {
      bufferKeyboard.charAt(0) == '-' ? setBufferTemp(bufferKeyboard.substring(1)) : setBufferTemp(bufferKeyboard)
    }
  };
  const onKeyReleased = (button: string) => {
    if (['default', 'float', 'dec-'].includes(activeInput.pattern) && activeInput.num && button === "-") {
      bufferKeyboard.charAt(0) == '-' ? setBufferKeyboard(bufferTemp) : setBufferKeyboard('-' + bufferTemp)
    }
  };

  const onOpenChange = (keys: any) => {
    const latestOpenKey = keys.find((key: any) => openKeys.indexOf(key) === -1);
    if (['settings', 'logs', 'reports'].indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const showDrawer = () => {
    setVisible(!visible);
  }

  const showUserDialog = () => {
    setUserDialogVisible(true);
  }

  const lngToLayout = () => {
    switch (keyboardLng) {
      case 'ru':
        activeInput.num ? setKeyboardLayout(numeric('ru').layout) : setKeyboardLayout(rulayout.layout)
        break;
      case 'tr':
        activeInput.num ? setKeyboardLayout(numeric('tr').layout) : setKeyboardLayout(trlayout.layout)
        break;
      case 'en':
        activeInput.num ? setKeyboardLayout(numeric('en').layout) : setKeyboardLayout(enlayout.layout)
        break;
      case 'es':
        activeInput.num ? setKeyboardLayout(numeric('es').layout) : setKeyboardLayout(eslayout.layout)
        break;
      default:
        break;
    }
  }

  const avatarColor = () => {
    let color;
    let role = token && JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role
    if (role == 'fixer') { color = "#108ee9" }
    else if (role == 'weaver') { color = "#87d068" }
    else if (role == 'manager') { color = "#2db7f5" }
    else if (role == 'admin') { color = "#f50" }
    else { color = "#0000006F" }
    return color;
  }

  const modeCodeObj = (code: Number) => {
    let obj;
    if (code == 0) { obj = { color: '#000000FF', text: t('tags.mode.init'), icon: <LoadingOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 1) { obj = { color: '#43A047FF', text: t('tags.mode.run'), icon: <SyncOutlined spin style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 2) { obj = { color: '#7339ABFF', text: t('tags.mode.stop'), icon: <ButtonIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 3) { obj = { color: '#FF7F27FF', text: t('tags.mode.stop'), icon: <WarpBeamIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 4) { obj = { color: '#FFB300FF', text: t('tags.mode.stop'), icon: <WeftIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 5) { obj = { color: '#E53935FF', text: t('tags.mode.stop'), icon: <ToolOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else if (code == 6) { obj = { color: '#005498FF', text: t('tags.mode.stop'), icon: <FabricFullIcon style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    else { obj = { color: '#00000000', text: t('tags.mode.unknown'), icon: <QuestionCircleOutlined style={{ fontSize: '150%', paddingInline: 5 }} /> } }
    return obj;
  }

  const curDate = today.toLocaleDateString(i18n.language == 'en' ? 'en-GB' : i18n.language, { day: 'numeric', month: 'numeric', year: 'numeric', });
  const curTime = `${today.toLocaleTimeString(i18n.language == 'en' ? 'en-GB' : i18n.language, { hour: 'numeric', minute: 'numeric', hour12: false })}\n\n`;

  const clock = async () => {
    let curTime = new Date();
    let sec = (60 - curTime.getSeconds()) * 1000;
    await setTimeout(() => {
      setDate(new Date());
      const timer = setInterval(() => { // Creates an interval which will update the current data every minute
        // This will trigger a rerender every component that uses the useDate hook.
        setDate(new Date());
      }, 60000);
      return () => {
        clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
      }
    }, sec);
  }

  const stopwatch = (start: any) => {
    let diff = dayjs.duration(dayjs().diff(start))
    return (diff.days() > 0 ? diff.days() + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + t('shift.secs') : "")
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

  const fetchTags = async (tagNames: string[]) => {
    try {
      const response = await fetch('http://localhost:3000/tags/filter', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8', },
        body: JSON.stringify({ name: tagNames }),
      });
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      (json || []).map((tag: any) => (
        tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec']).toString()));
      setTags({ data: json });
      let obj = tags.data.find(o => o['tag']['name'] == 'modeCode')
      obj && setModeCode({ val: obj['val'], updated: dayjs(obj['updated']) })
    }
    catch (error) { /*console.log(error);*/ }
  }

  const getTagLink = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { return obj['link'] }
    else { return false };
  }

  const getTagVal = (tagName: string) => {
    let obj = tags.data.find(o => o['tag']['name'] == tagName)
    if (obj) { return Number(obj['val']).toLocaleString(i18n.language); }
    else { return null };
  }

  const fetchShift = async () => {
    try {
      const response = await fetch('http://localhost:3000/shifts/currentshift');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setShift({ ...shift, name: json[0]['shiftname'], start: json[0]['shiftstart'], end: json[0]['shiftend'], duration: json[0]['shiftdur'] });
      setUpdated(false);
    }
    catch (error) { /*console.log(error);*/ }
  };
  const fetchStatInfo = async () => {
    try {
      if (shift.start && shift.end) {
        const response = await fetch('http://localhost:3000/shifts/getstatinfo', {
          method: 'POST',
          headers: { 'content-type': 'application/json;charset=UTF-8', },
          body: JSON.stringify({ start: shift.start, end: new Date() }),
        });
        if (!response.ok) { /*throw Error(response.statusText);*/ }
        const json = await response.json();
        setShift({ ...shift, picks: json[0]['picks'] || 0, meters: json[0]['meters'] || 0, rpm: json[0]['rpm'] || 0, mph: json[0]['mph'] || 0, efficiency: json[0]['efficiency'] || 0, starts: json[0]['starts'] || 0, runtime: json[0]['runtime'] || '', stops: json[0]['stops'] || {} });
        setUpdated(false);
      }
    }
    catch (error) { /*console.log(error);*/ }
  };

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://localhost:3000/reminders/active');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setRemindersFilter(differenceWith(json, (reminders || []), isEqual));
      if (!isEqual(reminders, json)) { setReminders(json) }
    }
    catch (error) { /*console.log(error);*/ }
  };

  useEffect(() => {
    (async () => {
      await fetchReminders();
      setUpdatedReminders(false);
    })();
    return () => { }
  }, [dayjs().minute(), updatedReminders])

  useEffect(() => {
    (reminders || []).map((note: any) => (
      openNotificationWithIcon('info', note['title'], 5, note['id'], note['descr'], { backgroundColor: '#e6f7ff', border: '2px solid #91d5ff' })));
    return () => { }
  }, [token])

  useEffect(() => {
    (remindersFilter || []).map((note: any) => (
      openNotificationWithIcon('info', note['title'], 0, note['id'], note['descr'], { backgroundColor: '#e6f7ff', border: '2px solid #91d5ff' })));
    return () => { }
  }, [remindersFilter])

  useEffect(() => {
    (async () => {
      await clock();
      await Promise.all([
        fetchLngs(),
        fetchShift(),
        checkLogin(),
        fetchReminders()
      ]);
      setUpdated(true);
    })();
    return () => { }
  }, [])

  useEffect(() => {
    (async () => {
      await Promise.all([
        fetchTags(['modeCode', 'stopAngle', 'speedMainDrive']),
        fetchStatInfo()
      ]);
    })();
    return () => { }
  }, [tags])

  useEffect(() => {
    (async () => {
      await fetchShift();
    })();
    return () => { }
  }, [updated, shift.end && dayjs().isAfter(shift.end)])

  useEffect(() => {
    (async () => {
      setToken(token);
      await checkShadowUser();
    })();
    return () => { }
  }, [token])

  useEffect(() => {
    setRemember(remember)
    return () => { }
  }, [remember])

  useEffect(() => {
    setInputWidth(span.current?.offsetWidth ? span.current?.offsetWidth < (window.innerWidth / 1.7) ? span.current?.offsetWidth + 5 : (window.innerWidth / 1.7) : 5)
    setControl(span.current?.offsetWidth ? span.current?.offsetWidth < (window.innerWidth / 1.7) ? false : true : false)
    keyboardRef.current?.setInput(bufferKeyboard)
    return () => { }
  }, [bufferKeyboard])

  useEffect(() => {
    keyboardRef.current?.setInput(activeInput.input);
    setBufferKeyboard(activeInput.input);
    return () => { }
  }, [activeInput.form, activeInput.id, activeInput.descr, activeInput.input])

  useEffect(() => {
    lngToLayout()
    return () => { }
  }, [activeInput.num, keyboardLng])

  const smallItems = [
    { label: <Link to="/"><Badge.Ribbon text={(reminders || []).length} color="purple" style={{ display: (reminders || []).length ? 'block' : 'none' }}><EyeOutlined style={{ fontSize: '100%' }} /></Badge.Ribbon></Link>, title: '', key: 'overview' },
  ];
  const smallItemsSA = [
    { label: <Link to="/"><Badge.Ribbon text={(reminders || []).length} color="purple" style={{ display: (reminders || []).length ? 'block' : 'none' }}><EyeOutlined style={{ fontSize: '100%' }} /></Badge.Ribbon></Link>, title: '', key: 'overview' },
    { label: <Link to="/users"><TeamOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'users' },
    { label: <Link to="/shifts"><ScheduleOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'shifts' },
    { label: <Link to="/reminders"><BellOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'reminders' },
  ];
  const smallItemsMan = [
    { label: <Link to="/"><Badge.Ribbon text={(reminders || []).length} color="purple" style={{ display: (reminders || []).length ? 'block' : 'none' }}><EyeOutlined style={{ fontSize: '100%' }} /></Badge.Ribbon></Link>, title: '', key: 'overview' },
    { label: <Link to="/shifts"><ScheduleOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'shifts' },
    { label: <Link to="/reminders"><BellOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'reminders' },
  ];
  const smallItemsFix = [
    { label: <Link to="/"><Badge.Ribbon text={(reminders || []).length} color="purple" style={{ display: (reminders || []).length ? 'block' : 'none' }}><EyeOutlined style={{ fontSize: '100%' }} /></Badge.Ribbon></Link>, title: '', key: 'overview' },
    { label: <Link to="/reminders"><BellOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'reminders' },
  ];
  const bigItems = [
    { label: <Link onClick={showDrawer} to="/">{t('menu.overview')}</Link>, title: '', key: 'overview', icon: <EyeOutlined style={{ fontSize: '100%' }} /> },
    { label: t('menu.settings'), title: '', key: 'settings', icon: <SettingOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/settings/settingsTech">{t('menu.settingsTech')}</Link>, title: '', key: 'settingsTech', }, { label: <Link onClick={showDrawer} to="/settings/settingsOp">{t('menu.settingsOp')}</Link>, title: '', key: 'settingsOp', }, { label: <Link onClick={showDrawer} to="/settings/settingsDev">{t('menu.settingsDev')}</Link>, title: '', key: 'settingsDev', }] },
    { label: t('menu.reports'), title: '', key: 'reports', icon: <ReconciliationOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/reports/monthReport">{t('menu.monthReport')}</Link>, title: '', key: 'monthReport', }, { label: <Link onClick={showDrawer} to="/reports/userReport">{t('menu.userReport')}</Link>, title: '', key: 'userReport', }] },
    { label: t('menu.logs'), title: '', key: 'logs', icon: <ReadOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/logs/modelog">{t('menu.modelog')}</Link>, title: '', key: 'modelog', }, { label: <Link onClick={showDrawer} to="/logs/userlog">{t('menu.userlog')}</Link>, title: '', key: 'userlog', }, { label: <Link onClick={showDrawer} to="/logs/clothlog">{t('menu.clothlog')}</Link>, title: '', key: 'clothlog', }] },
    { label: <Link onClick={showDrawer} to="/machineInfo">{t('menu.machineInfo')}</Link>, title: '', key: 'machineInfo', icon: <TagsOutlined style={{ fontSize: '100%' }} /> },
  ];

  return (
    <div>
      <ConfigProvider locale={i18n.language === 'en' ? enlocale : i18n.language === 'ru' ? rulocale : i18n.language === 'tr' ? trlocale : i18n.language === 'es' ? eslocale : enlocale}>
        <Layout className="layout">
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
            <div className="logo" onClick={showDrawer}>
              <img src={logo} className="applogo" alt=""></img>
            </div>
            <Menu style={{ fontSize: '150%' }} disabledOverflow theme='dark' mode="horizontal" selectedKeys={location.pathname == '/' ? ['overview'] : [location.pathname.split("/").slice(-1)[0]]} defaultSelectedKeys={['overview']} items={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? smallItemsSA : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? smallItemsMan : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? smallItemsFix : smallItems : smallItems} />
            <div className="speed"><Spin wrapperClassName="speed" spinning={modeCode.val == 1 ? !getTagLink('speedMainDrive') : !getTagLink('stopAngle')}>{modeCode.val == 1 ? <DashboardOutlined style={{ fontSize: '80%', paddingInline: 5 }} /> : <AimOutlined style={{ fontSize: '80%', paddingInline: 5 }} />}{modeCode.val == 1 ? getTagVal('speedMainDrive') : getTagVal('stopAngle')}<div className="sub">{modeCode.val == 1 ? t('tags.speedMainDrive.eng') : '°'}</div></Spin></div>
            <div className="mode" style={{ backgroundColor: modeCodeObj(modeCode.val).color }}><Spin wrapperClassName="mode" spinning={!getTagLink('modeCode')}>{modeCodeObj(modeCode.val).text + ' '}{modeCodeObj(modeCode.val).icon}<div className='stopwatch'>{stopwatch(modeCode.updated)}</div></Spin></div>
            {shift.name && <div className="shift"><div className="text"><Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>{t('shift.shift') + ' ' + shift.name}<div className="percent">{Number(Number(shift.efficiency).toFixed(shift.efficiency < 10 ? 2 : 1).toString()).toLocaleString(i18n.language) + '%'}</div></Space></div><div className="progress"><Progress percent={shift.efficiency} showInfo={false} size="small" /></div></div>}
            <div className="user">
              <div className="user" onClick={() => { !visible && showUserDialog() }}>
                <Avatar.Group size='large'>
                  {shadowUser['name'] && <Tooltip title={shadowUser['name']} placement="bottom">
                    <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                  </Tooltip>}
                  <Avatar size={50} style={{ backgroundColor: avatarColor() }} icon={<UserOutlined />} />
                </Avatar.Group>
                <table><tbody><tr><td><div className='username'>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</div></td></tr><tr><td><div className='userrole'>{t(token ? 'user.' + JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : '')}</div></td></tr></tbody></table>
              </div><UserLogin shadowUser={shadowUser} token={token} setToken={setToken} isModalVisible={userDialogVisible} setIsModalVisible={setUserDialogVisible} setRemember={setRemember} activeInput={activeInput} setActiveInput={setActiveInput} />
            </div>
            <div className="clock">
              <div className="time">{curTime}</div><div className="date">{curDate}</div>
            </div>
          </Header>
          <div className="site-drawer-render-in-current-wrapper">
            <Content className="content">
              <div>
                <Breadcrumb />
              </div>
              <div className="site-layout-content">
                <Routes>
                  <Route index element={<Overview token={token} modeCode={modeCode} shift={shift} shadowUser={shadowUser} reminders={reminders} setUpdatedReminders={setUpdatedReminders} />} />
                  <Route path={'/machineInfo'} element={<MachineInfo />} />
                  <Route path={'/reminders'} element={token ? ['fixer', 'manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? <Reminders activeInput={activeInput} setActiveInput={setActiveInput} setUpdatedReminders={setUpdatedReminders} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path={'/reports'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/monthReport'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/userReport'} element={<UserReport token={token} shadowUser={shadowUser} />} />
                  <Route path={'/logs'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/modelog'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/userlog'} element={<UserLog token={token} />} />
                  <Route path={'/logs/clothlog'} element={<ClothLog token={token} />} />
                  <Route path={'/settings'} element={<SettingsTech token={token} activeInput={activeInput} setActiveInput={setActiveInput} modeCode={modeCode} />} />
                  <Route path={'/settings/settingsTech'} element={<SettingsTech token={token} activeInput={activeInput} setActiveInput={setActiveInput} modeCode={modeCode} />} />
                  <Route path={'/settings/settingsOp'} element={<SettingsOp token={token} activeInput={activeInput} setActiveInput={setActiveInput} />} />
                  <Route path={'/settings/settingsDev'} element={<SettingsDev token={token} activeInput={activeInput} setActiveInput={setActiveInput} />} />
                  <Route path={'/users'} element={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'admin' ? <Users activeInput={activeInput} setActiveInput={setActiveInput} token={token} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path={'/shifts'} element={token ? ['manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? <Shifts activeInput={activeInput} setActiveInput={setActiveInput} setUpdated={setUpdated} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Drawer
                  placement="left"
                  closable={false}
                  open={visible}
                  getContainer={false}
                  style={{ position: 'absolute', }}
                  bodyStyle={{ margin: "0px", padding: "0px" }}
                >
                  <Menu style={{ fontSize: '150%' }} mode="inline" items={bigItems} openKeys={openKeys} onOpenChange={onOpenChange} selectedKeys={location.pathname == '/' ? ['overview'] : location.pathname.split("/").filter((item) => item)} defaultSelectedKeys={['overview']}>
                  </Menu>
                </Drawer>
                <Drawer
                  autoFocus={false}
                  //destroyOnClose={true}
                  title={
                    <div style={{ display: 'inline-flex', width: '100%' }}>
                      <span ref={descr} className='descr'>{activeInput.descr}</span>
                      <div className='sel' style={{ position: 'absolute', opacity: 0, height: 0, overflow: 'hidden', whiteSpace: 'pre' }}><span className="text" ref={span}>{bufferKeyboard}</span></div>
                      <Space direction="horizontal" style={{ width: '100%', justifyContent: control ? 'space-between' : 'center' }}>
                        {control && <Button style={{ width: 41 }} type="link" onClick={() => { inputRef.current!.focus({ cursor: 'start', }); }} icon={<CaretLeftOutlined />}></Button>}
                        {activeInput.showInput ? <Input style={{ color: "#005092", width: inputWidth }} size='small' value={bufferKeyboard} bordered={false} ref={inputRef} /> : <Input.Password style={{ color: "#005092", width: inputWidth }} size='small' value={bufferKeyboard} bordered={false} visibilityToggle={false} ref={inputRef} />}
                        {control && <Button style={{ width: 41 }} type="link" onClick={() => { inputRef.current!.focus({ cursor: 'end', }); }} icon={<CaretRightOutlined />}></Button>}
                      </Space>
                    </div>
                  }
                  placement="bottom"
                  height={keyboardCollapse ? 42 : 376}
                  mask={true}
                  maskStyle={{ backgroundColor: "inherit", opacity: 0 }}
                  maskClosable={true}
                  open={activeInput.showKeyboard}
                  onClose={() => { setActiveInput({ ...activeInput, showKeyboard: false }); setBufferKeyboard(activeInput.input) }}
                  closeIcon={<CloseOutlined style={{ color: '#1890ff', fontSize: '150%' }} />}
                  headerStyle={{ padding: 0 }}
                  bodyStyle={{ margin: "0px", padding: "0px", background: '#E1F5FE' }}
                  extra={
                    <>
                      {bufferKeyboard && <Button style={{ width: 41 }} type="link" onClick={() => { setBufferKeyboard(''); }} icon={<CloseCircleTwoTone style={{ fontSize: '130%' }} />}></Button>}
                      <Button style={{ width: 41 }} type="link" onClick={() => { setActiveInput({ ...activeInput, showInput: !activeInput.showInput }); }} icon={activeInput.showInput ? <EyeTwoTone style={{ fontSize: '130%' }} /> : <EyeInvisibleOutlined style={{ fontSize: '130%' }} />}></Button>
                      <Button style={{ width: 41, color: "#1890ff", fontSize: '20px', padding: 0 }} type="link" onClick={() => { setActiveInput({ ...activeInput, num: !activeInput.num }); }} >{activeInput.num ? 'ABC' : '123'}</Button>
                      <Select style={{ color: "#005092" }} value={keyboardLng} optionLabelProp="label" size="large" dropdownStyle={{ fontSize: '40px !important', zIndex: 2000 }} dropdownAlign={{ offset: [-45, 4] }} dropdownMatchSelectWidth={false} onChange={(val) => { setKeyboardLng(val); }} bordered={false} suffixIcon={<GlobalOutlined style={{ color: '#1890ff', fontSize: '130%' }} />}
                      >
                        {(lngs.data || []).map(lng => (
                          <Option key={lng['locale']} value={lng['locale']} label={String(lng['locale']).toUpperCase()}>
                            <div>{String(lng['locale']).toUpperCase()} - {t('self', { lng: lng['locale'] })}</div></Option>
                        ))}
                      </Select>
                      <Button style={{ width: 41 }} type="link" icon={keyboardCollapse ? <ToTopOutlined style={{ fontSize: '150%' }} /> : <VerticalAlignBottomOutlined style={{ fontSize: '150%' }} />} onClick={() => { setKeyboardCollapse(!keyboardCollapse) }} />

                    </>
                  }
                  zIndex={2000}
                >
                  <Keyboard
                    keyboardRef={(r) => (keyboardRef.current = r)}
                    layout={keyboardLayout}
                    theme={activeInput.num ? "numericTheme" : "hg-theme-default"}
                    layoutName={layout}
                    onKeyPress={onKeyPress}
                    onKeyReleased={onKeyReleased}
                    physicalKeyboardHighlight={true}
                    physicalKeyboardHighlightPress={true}
                    onChange={(input) => {
                      setBufferKeyboard(input);
                      if (activeInput.form == 'login' && activeInput.id == 'name') {
                        setActiveInput({ ...activeInput, input: input })
                      }
                    }}
                    display={activeInput.num ? { '-': '+/-', '{bksp}': '🠔', '{enter}': '⤶', '{lock}': '⇧', '{space}': '﹈', } : { '{bksp}': '🠔', '{enter}': '⤶', '{lock}': '⇧', '{space}': '﹈', }}
                    excludeFromLayout={{
                      default: [".com", "{tab}", "{shift}"], shift: [".com", "{tab}", "{shift}"]
                    }}
                    inputName={activeInput.pattern}
                    inputPattern={{
                      'default': /.*/,
                      'shift': /^.{1,2}$/,
                      'username': /^[\p{L}\s]*$/gu,
                      'phonenumber': /^[0-9]{1,15}$/,
                      'email': /^[a-zA-Z0-9.!@#$%&’*+/=?^_`{|}~-]*$/,
                      'float': /[+-]?([0-9\s\.\,])+/,
                      'ip': /^[0-9\.]{1,15}$/,
                      'dec-': /^-?(0|[1-9][\d\s]*)$/,
                      'dec+': /^(0|[1-9\s][\d\s]*)$/,
                    }
                    }
                  />
                </Drawer>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center', margin: '0px', padding: '3px', color: 'rgba(0, 0, 0, 0.45)' }}>{t('footer')}</Footer>
          </div>
        </Layout>
      </ConfigProvider>
    </div >
  )
}

export default App

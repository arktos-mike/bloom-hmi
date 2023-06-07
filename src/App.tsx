import React, { useState, useEffect, useRef, memo } from 'react'
import { useSSE } from 'react-hooks-sse';
import logo from '/icon.svg'
import 'styles/app.less'
import { Route, Link, Routes, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Input, notification, ConfigProvider, Space, Progress, Avatar, Tooltip, Spin, Badge } from 'antd';
import { BellOutlined, ReconciliationOutlined, TagsOutlined, ReadOutlined, ScheduleOutlined, ToolOutlined, QuestionCircleOutlined, SyncOutlined, LoadingOutlined, AimOutlined, DashboardOutlined, CloseCircleTwoTone, EyeTwoTone, EyeInvisibleOutlined, GlobalOutlined, CloseOutlined, ToTopOutlined, VerticalAlignBottomOutlined, EyeOutlined, TeamOutlined, SettingOutlined, UserOutlined, CaretLeftOutlined, CaretRightOutlined, UsbTwoTone } from '@ant-design/icons';
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
import 'dayjs/locale/en-gb';

import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import SettingsTech from './page/settings_tech';
import { Breadcrumb } from './components';
import Reminders from './page/reminders';

import { differenceWith, isEqual } from 'lodash-es';

import type { InputRef } from 'antd';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App: React.FC = memo(() => {
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
      else { setShadowUser({ id: null, name: null, logintime: json[0]?.logintime }); }
    }
    catch (error) { /*console.log(error);*/ }
  }

  const checkLogin = async () => {
    try {
      const ans = await fetch('http://localhost:3000/logs/admuser');
      const json = await ans.json();
      if (!ans.ok) { throw Error(ans.statusText); }
      if (json.length) {
        const response = await fetch('http://localhost:3000/users/login/' + json[0].id, {
          method: 'POST'
        });
        const jsonb = await response.json();
        setToken(jsonb.token || token);
        if (!response.ok) { /*throw Error(response.statusText);*/ }
      }
      else {
        const ans = await fetch('http://localhost:3000/logs/user');
        const json = await ans.json();
        if (!ans.ok) { throw Error(ans.statusText); }
        if (json.length) {
          const response = await fetch('http://localhost:3000/users/login/' + json[0].id, {
            method: 'POST'
          });
          const jsonb = await response.json();
          setToken(jsonb.token || token);
          if (!response.ok) { /*throw Error(response.statusText);*/ }
        }
        else { setToken(null); }
      }
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
  const [period, setPeriod] = useState('shift')
  const [all, setAll] = useState<any>()
  const [tags, setTags] = useState<any[]>([])
  const [modeCode, setModeCode] = useState<any>();
  const [activeInput, setActiveInput] = useState({ form: '', id: '', num: false, showInput: true, input: '', showKeyboard: false, descr: '', pattern: 'default' })
  const [keyboardLayout, setKeyboardLayout] = useState(enlayout.layout)
  const [keyboardLng, setKeyboardLng] = useState('en')
  const [keyboardCollapse, setKeyboardCollapse] = useState(false)
  const [bufferKeyboard, setBufferKeyboard] = useState('')
  const [bufferTemp, setBufferTemp] = useState('')
  const [lngs, setLngs] = useState({ data: [] })
  const [token, setToken] = useState<string | null>(null)
  const [shadowUser, setShadowUser] = useState(all?.weaver)
  const [remember, setRemember] = useState(true)
  const [control, setControl] = useState(false)
  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [userDialogVisible, setUserDialogVisible] = useState(false)
  const [layout, setLayout] = useState('default')
  const [efficiency, setEfficiency] = useState<number>()
  const [periodName, setPeriodName] = useState<string>('')
  const [updated, setUpdated] = useState(false)
  const [updatedReminders, setUpdatedReminders] = useState(false)
  const [openKeys, setOpenKeys] = useState(['']);
  const [reminders, setReminders] = useState()
  const [remindersFilter, setRemindersFilter] = useState<any[]>([])

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
        activeInput.num ? setKeyboardLayout(numeric('en').layout) : setKeyboardLayout(enlayout.layout)
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
      }, 1000);
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

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      //json.map((tag: any) => (
      //  tag['val'] = Number(tag['val']).toFixed(tag['tag']['dec']).toString()
      //)
      //);
      setTags(json);
      let obj = json.find((o: any) => o['tag']['name'] == 'modeCode')
      if (obj && (modeCode?.val === undefined || dayjs(obj['updated']).isAfter(dayjs(modeCode.updated)))) {
        setModeCode({ val: obj['val'], updated: dayjs(obj['updated']) })
      }
      //obj && setModeCode({ val: obj['val'], updated: dayjs(obj['updated']) })
      postMessage({ payload: 'removeLoading' }, '*')
    }
    catch (error) { /*console.log(error);*/ }
  }

  const fetchAll = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags/full');
      if (!response.ok) { /*throw Error(response.statusText);*/ }
      const json = await response.json();
      setAll(json);
    }
    catch (error) { /*console.log(error);*/ }
  }

  const getTagLink = (tagName: string) => {
    let obj = tags.find(o => o['tag']['name'] == tagName)
    if (obj) { return obj['link'] }
    else { return false };
  }

  const getTagVal = (tagName: string) => {
    let obj = tags.find(o => o['tag']['name'] == tagName)
    if (obj) { return Number(obj['val']).toLocaleString(i18n.language); }
    else { return null };
  }

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
      await Promise.all([
        clock(),
        fetchLngs(),
        checkLogin(),
        fetchReminders(),
        fetchTags(),
        fetchAll()
      ]);
      setUpdated(true);
    })();
    return () => { }
  }, [])

  useEffect(() => {
    fetchTags();
  }, [location]);

  useEffect(() => {
    dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
    return () => { }
  }, [i18n.language])

  const info = useSSE(
    'info',
    {
      tags: [],
      shift: { shiftname: '', shiftstart: '', shiftend: '', shiftdur: '' },
      weaver: { id: '', name: '', logintime: '' },
      userinfo: { picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 },
      shiftinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 } || null,
      dayinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 },
      monthinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0 }
    },
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const fullinfo = useSSE(
    'fullinfo',
    {
      tags: [],
      rolls: null,
      modeCode: { val: 0, updated: '' },
      shift: { shiftname: '', shiftstart: '', shiftend: '', shiftdur: '' },
      lifetime: { type: '', serialno: '', mfgdate: '', picks: 0, cloth: 0, motor: '' },
      weaver: { id: '', name: '', logintime: '' },
      userinfo: { workdur: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} },
      shiftinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} } || null,
      dayinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} },
      monthinfo: { start: '', end: '', picks: 0, meters: 0, rpm: 0, mph: 0, efficiency: 0, starts: 0, runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 }, stops: {} }
    },
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const mon = useSSE(
    'tags',
    [{
      tag: null,
      val: Number(null),
      updated: null,
      link: null
    }],
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const pieces = useSSE(
    'rolls',
    '',
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const usb = useSSE(
    'usb',
    false,
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const usbtoken = useSSE(
    'auth',
    '',
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  const userinfo = useSSE(
    'userinfo',
    {
      workdur: '',
      picks: 0,
      meters: 0,
      rpm: 0,
      mph: 0,
      efficiency: 0,
      start: '',
      starts: 0,
      runtime: { milliseconds: 0, seconds: 0, minutes: 0, hours: 0, days: 0, weeks: 0, months: 0, years: 0 },
      stops: {}
    },
    {
      parser(input: string) {
        return JSON.parse(input);
      },
    }
  );

  useEffect(() => {
    if (tags.length > 0) {
      const updatedTags = tags.map(obj => info.tags.find((o: any) => (o['tag']!['name'] === obj['tag']['name']) && (dayjs(o['updated']).isAfter(dayjs(obj['updated'])))) || obj);
      setTags(updatedTags);
    }
  }, [info.tags]);

  useEffect(() => {
    if (tags.length > 0) {
      const updatedTags = tags.map(obj => fullinfo.tags.find((o: any) => (o['tag']!['name'] === obj['tag']['name']) && (dayjs(o['updated']).isAfter(dayjs(obj['updated'])))) || obj);
      setTags(updatedTags);
    }
  }, [fullinfo.tags]);

  useEffect(() => {
    if (fullinfo.modeCode && (modeCode?.val === undefined || dayjs(fullinfo.modeCode['updated']).isAfter(dayjs(modeCode.updated)))) {
      setModeCode({ val: fullinfo.modeCode['val'], updated: dayjs(fullinfo.modeCode['updated']) })
    }
  }, [fullinfo.modeCode]);

  useEffect(() => {
    if (period == 'day' || ((!info.shift.shiftstart || !info.shift.shiftend) && period == 'shift')) { setPeriodName(dayjs(info.dayinfo?.start).format('LL')); setEfficiency(info.dayinfo?.efficiency); }
    else if (period == 'shift') { setPeriodName(t('shift.shift') + ' ' + info.shift?.shiftname); setEfficiency(info.shiftinfo?.efficiency); }
    else if (period == 'month') { setPeriodName(dayjs(info.monthinfo?.start).format('MMMM YYYY')); setEfficiency(info.monthinfo?.efficiency); }
  }, [info.dayinfo?.end, period]);

  useEffect(() => {
    if (tags.length > 0) {
      const updatedTags = tags.map(obj => mon.find((o: any) => (o['tag']!['name'] === obj['tag']['name']) && (dayjs(o['updated']).isAfter(dayjs(obj['updated'])))) || obj);
      setTags(updatedTags);
      let object = mon.find(o => o['tag']!['name'] == 'modeCode')
      if (object && (modeCode?.val === undefined || dayjs(object['updated']).isAfter(dayjs(modeCode.updated)))) {
        setModeCode({ val: object['val'], updated: dayjs(object['updated']) })
      }
    }
  }, [mon]);

  useEffect(() => {
    (async () => {
      await fetchReminders();
      setUpdatedReminders(false);
    })();
    return () => { }
  }, [dayjs().minute(), updatedReminders])

  useEffect(() => {
    (async () => {
      await checkLogin();
      usbtoken && openNotificationWithIcon('success', t('notifications.userok'), 3, '', '', { backgroundColor: '#f6ffed', border: '2px solid #b7eb8f' });
      if (usbtoken == null) { await checkShadowUser(); }
    })();
    return () => { }
  }, [usbtoken])

  useEffect(() => {
    (reminders || []).map((note: any) => (
      openNotificationWithIcon('info', note['title'], 5, note['id'], note['descr'], { backgroundColor: '#e6f7ff', border: '2px solid #91d5ff' })));
    return () => { }
  }, [token])

  useEffect(() => {
    remindersFilter.map((note: any) => (
      openNotificationWithIcon('info', note['title'], 0, note['id'], note['descr'], { backgroundColor: '#e6f7ff', border: '2px solid #91d5ff' })));
    return () => { }
  }, [remindersFilter])

  useEffect(() => {
    (async () => {
      //setToken(token);
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
            <div className="speed"><Spin wrapperClassName="speed" spinning={modeCode?.val == 1 ? !getTagLink('speedMainDrive') : !getTagLink('stopAngle')}>{modeCode?.val == 1 ? <DashboardOutlined style={{ fontSize: '80%', paddingInline: 5 }} /> : <AimOutlined style={{ fontSize: '80%', paddingInline: 5 }} />}{modeCode?.val == 1 ? getTagVal('speedMainDrive') : getTagVal('stopAngle')}<div className="sub">{modeCode?.val == 1 ? t('tags.speedMainDrive.eng') : '°'}</div></Spin></div>
            <div className="mode" style={{ backgroundColor: modeCodeObj(modeCode?.val).color }}><Spin wrapperClassName="mode" spinning={!getTagLink('modeCode')}>{modeCodeObj(modeCode?.val).text + ' '}{modeCodeObj(modeCode?.val).icon}<div className='stopwatch'>{stopwatch(modeCode?.updated)}</div></Spin></div>
            <div className="shift"><div className="text"><Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>{(period == 'day' || ((!info.shift.shiftstart || !info.shift.shiftend) && period == 'shift')) ? dayjs().format('L') : period == 'shift' ? periodName : period == 'month' ? dayjs().format('MMM YY') : ''}<div className="percent">{efficiency ? Number(Number(efficiency).toFixed((efficiency && (efficiency < 10)) ? 2 : 1).toString()).toLocaleString(i18n.language) + '%' : ''}</div></Space></div><div className="progress"><Progress percent={efficiency ? efficiency : 0} showInfo={false} size="small" /></div></div>
            {usb && <div className="usb"><UsbTwoTone twoToneColor="#52c41a" style={{ fontSize: '200%' }}/></div>}
            <div className="user">
              <div className="user" onClick={() => { !visible && showUserDialog() }}>
                <Avatar.Group size='large'>
                  {shadowUser?.name && <Tooltip title={shadowUser?.name} placement="bottom">
                    <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                  </Tooltip>}
                  <Avatar size={50} style={{ backgroundColor: avatarColor() }} icon={<UserOutlined />} />
                </Avatar.Group>
                <table><tbody><tr><td><div className='username'>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</div></td></tr><tr><td><div className='userrole'>{t(token ? 'user.' + JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : '')}</div></td></tr></tbody></table>
              </div><UserLogin shadowUser={shadowUser} usb={usb} token={token} setToken={setToken} isModalVisible={userDialogVisible} setIsModalVisible={setUserDialogVisible} setRemember={setRemember} activeInput={activeInput} setActiveInput={setActiveInput} />
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
                  <Route index element={<Overview period={period} setPeriod={setPeriod} pieces={Math.max(Number(pieces), (fullinfo.rolls != null) ? fullinfo.rolls : all?.rolls)} tags={tags} token={token} modeCode={modeCode} info={info} fullinfo={fullinfo.lifetime.mfgdate ? fullinfo : all} userinfo={userinfo} shadowUser={shadowUser} reminders={reminders} setUpdatedReminders={setUpdatedReminders} />} />
                  <Route path={'/machineInfo'} element={<MachineInfo lifetime={fullinfo.lifetime.mfgdate ? fullinfo.lifetime : all?.lifetime} tags={tags} modeCode={modeCode} />} />
                  <Route path={'/reminders'} element={token ? ['fixer', 'manager', 'admin'].includes(JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role) ? <Reminders activeInput={activeInput} setActiveInput={setActiveInput} setUpdatedReminders={setUpdatedReminders} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path={'/reports'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/monthReport'} element={<MonthReport token={token} />} />
                  <Route path={'/reports/userReport'} element={<UserReport token={token} shadowUser={shadowUser} />} />
                  <Route path={'/logs'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/modelog'} element={<ModeLog token={token} />} />
                  <Route path={'/logs/userlog'} element={<UserLog token={token} />} />
                  <Route path={'/logs/clothlog'} element={<ClothLog token={token} />} />
                  <Route path={'/settings'} element={<SettingsTech tags={tags} token={token} activeInput={activeInput} setActiveInput={setActiveInput} modeCode={modeCode} />} />
                  <Route path={'/settings/settingsTech'} element={<SettingsTech tags={tags} token={token} activeInput={activeInput} setActiveInput={setActiveInput} modeCode={modeCode} />} />
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
                    display={activeInput.num ? { '-': '+/-', '{bksp}': '⇦', '{enter}': '⤶', '{lock}': '⇧', '{space}': '—', } : { '{bksp}': '⇦', '{enter}': '⤶', '{lock}': '⇧', '{space}': '—', }}
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
},
  (pre, next) => {
    return isEqual(pre, next);
  }
);

export default App

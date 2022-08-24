import React, { useState, useEffect, useRef } from 'react'
import logo from '/icon.svg'
import 'styles/app.css'
import { Route, Link, Routes, useLocation, Navigate } from 'react-router-dom';
import { Layout, Menu, Select, Drawer, Button, Modal, Input, Form, Checkbox, notification, DatePicker, TimePicker, ConfigProvider, Breadcrumb, InputRef, Space } from 'antd';
import { CloseCircleTwoTone, EyeTwoTone, EyeInvisibleOutlined, GlobalOutlined, CloseOutlined, ToTopOutlined, VerticalAlignBottomOutlined, EyeOutlined, TeamOutlined, ToolOutlined, SettingOutlined, UserOutlined, LockOutlined, ApartmentOutlined, SendOutlined, AlertOutlined } from '@ant-design/icons';
import { FabricPieceIcon } from "./components/Icons"
import { useIdleTimer } from 'react-idle-timer'
import Overview from "./page/overview";
import SettingsOp from "./page/settings_op";
import SettingsDev from "./page/settings_dev";
import Users from "./page/users";
import UserLogin from "./dialog/UserLogin";
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

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App: React.FC = () => {

  const keyboardRef = useRef<KeyboardReactInterface | null>(null)
  const span = useRef<HTMLSpanElement | null>(null);
  const descr = useRef<HTMLSpanElement | null>(null);
  const location = useLocation();
  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  };

  const onIdle = () => {
    if (!remember) {
      setToken(null);
      openNotificationWithIcon('warning', t('notifications.idle'), 0);
    }
  }

  const idleTimer = useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 5,
    debounce: 250
  })

  const { t, i18n } = useTranslation();

  const i18name = (name: string) => {
    switch (name) {
      case 'general':
        return 'panel.general';
      case 'stop':
      case 'ready':
      case 'run':
      case 'alarm':
        return 'tags.mode.' + name;
      case 'run1':
        return 'panel.left';
      case 'run2':
        return 'panel.right';
      default:
        return 'menu.' + name;
    }
  }

  const BreadCrumb = () => {
    const location = useLocation();
    const { pathname } = location;
    const pathnames = pathname.split("/").filter((item) => item);
    return (
      <Breadcrumb separator=">" style={{ margin: '3px 0' }}>
        {(pathnames || []).length > 0 ? (
          <Breadcrumb.Item key="overview">
            <Link to="/"><EyeOutlined /></Link>
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key="overview"><EyeOutlined /> {t('menu.overview')}</Breadcrumb.Item>
        )}
        {(pathnames || []).map((name, index) => {
          const routeTo = `/${(pathnames || []).slice(0, index + 1).join("/")}`;
          const isLast = index === (pathnames || []).length - 1;
          return isLast ? (
            <Breadcrumb.Item key={name}>{t(i18name(name))}</Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item key={name}>
              <Link to={`${routeTo}`}>{t(i18name(name))}</Link>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  }
  const [inputWidth, setInputWidth] = useState<number | undefined>(0)
  const [activeInput, setActiveInput] = useState({ form: '', id: '', num: false, showInput: true, input: '', showKeyboard: false, descr: '', pattern: 'default' })
  const [keyboardLayout, setKeyboardLayout] = useState(enlayout.layout)
  const [keyboardLng, setKeyboardLng] = useState('en')
  const [keyboardCollapse, setKeyboardCollapse] = useState(false)
  const [bufferKeyboard, setBufferKeyboard] = useState('')
  const [bufferTemp, setBufferTemp] = useState('')
  const [lngs, setLngs] = useState({ data: [] })
  const [token, setToken] = useState<string | null>(null)
  const [remember, setRemember] = useState(true)
  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [userDialogVisible, setUserDialogVisible] = useState(false)
  const [layout, setLayout] = useState('default')

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

  const fetchLngs = async () => {
    try {
      const response = await fetch('http://localhost:3000/locales');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setLngs({ data: json });
    }
    catch (error) { console.log(error); }
  }

  useEffect(() => {
    clock();
    fetchLngs();
  }, [])

  useEffect(() => {
    setToken(token)
  }, [token])

  useEffect(() => {
    setRemember(remember)
  }, [remember])

  useEffect(() => {
    setInputWidth(span.current?.offsetWidth ? span.current?.offsetWidth + 5 : 5)
    keyboardRef.current?.setInput(bufferKeyboard)
  }, [bufferKeyboard])

  useEffect(() => {
    keyboardRef.current?.setInput(activeInput.input);
    setBufferKeyboard(activeInput.input);
  }, [activeInput.form, activeInput.id, activeInput.descr, activeInput.input])

  useEffect(() => {
    lngToLayout()
  }, [activeInput.num, keyboardLng])

  const smallItems = [
    { label: <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'overview' },
  ];
  const smallItemsSA = [
    { label: <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'overview' },
    { label: <Link to="/users"><TeamOutlined style={{ fontSize: '100%' }} /></Link>, title: '', key: 'users' },
  ];
  const bigItems = [
    { label: <Link onClick={showDrawer} to="/">{t('menu.overview')}</Link>, title: '', key: 'overview', icon: <EyeOutlined style={{ fontSize: '100%' }} /> },
    { label: t('menu.settings'), title: '', key: 'settings', icon: <SettingOutlined style={{ fontSize: '100%' }} />, children: [{ label: <Link onClick={showDrawer} to="/settings/settingsOp">{t('menu.settingsOp')}</Link>, title: '', key: 'settingsOp', }, { label: <Link onClick={showDrawer} to="/settings/settingsDev">{t('menu.settingsDev')}</Link>, title: '', key: 'settingsDev', }] },
    { label: <Link onClick={showDrawer} to="/alarms">{t('menu.alarms')}</Link>, title: '', key: 'alarms', icon: <AlertOutlined style={{ fontSize: '100%' }} /> },
    { label: <Link onClick={showDrawer} to="/system">{t('menu.system')}</Link>, title: '', key: 'system', icon: <FabricPieceIcon style={{ fontSize: '110%' }} /> },
  ];

  return (
    <div>
      <ConfigProvider locale={i18n.language === 'en' ? enlocale : i18n.language === 'ru' ? rulocale : i18n.language === 'tr' ? trlocale : i18n.language === 'es' ? eslocale : enlocale}>
        <Layout className="layout">
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
            <div className="logo" onClick={showDrawer}>
              <img src={logo} className="applogo" alt=""></img>
            </div>
            <Menu style={{ flex: 'auto', fontSize: '150%' }} theme='dark' mode="horizontal" selectedKeys={[location.pathname == '/' ? 'overview' : location.pathname.split("/").filter((item) => item)[0]]} defaultSelectedKeys={['overview']} items={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == "sa" ? smallItemsSA : smallItems : smallItems}>
            </Menu>
            <div className="mode" style={{ backgroundColor: '#00000000' }}>
            </div>
            <div className="user">
              <Button type="primary" size="large" shape="circle" onClick={showUserDialog} icon={<UserOutlined style={{ fontSize: '120%' }} />} style={{ background: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? "#108ee9" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? "#87d068" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? "#2db7f5" : "#f50" : "", borderColor: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? "#108ee9" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? "#87d068" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? "#2db7f5" : "#f50" : "" }} /><table><tbody><tr><td><div className='username'>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</div></td></tr><tr><td><div className='userrole'>{t(token ? 'user.' + JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role : '')}</div></td></tr></tbody></table>
              <UserLogin token={token} setToken={setToken} isModalVisible={userDialogVisible} setIsModalVisible={setUserDialogVisible} setRemember={setRemember} activeInput={activeInput} setActiveInput={setActiveInput} />
            </div>
            <div className="clock">
              <div className="time">{curTime}</div><div className="date">{curDate}</div>
            </div>
          </Header>
          <div className="site-drawer-render-in-current-wrapper">
            <Content className="content">
              <div>
                <BreadCrumb />
              </div>
              <div className="site-layout-content">
                <Routes>
                  <Route index element={<Overview />} />
                  <Route path={'/settings/settingsOp'} element={<SettingsOp token={token} activeInput={activeInput} setActiveInput={setActiveInput} />} />
                  <Route path={'/settings/settingsDev'} element={<SettingsDev token={token} activeInput={activeInput} setActiveInput={setActiveInput} />} />
                  <Route path={'/users'} element={token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == "sa" ? <Users activeInput={activeInput} setActiveInput={setActiveInput} token={token} /> : <Navigate to="/" /> : <Navigate to="/" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Drawer
                  placement="left"
                  closable={false}
                  visible={visible}
                  getContainer={false}
                  style={{ position: 'absolute', }}
                  bodyStyle={{ margin: "0px", padding: "0px" }}
                >
                  <Menu style={{ fontSize: '150%' }} mode="inline" items={bigItems} selectedKeys={[location.pathname == '/' ? 'overview' : location.pathname.split("/").filter((item) => item)[0]]} defaultSelectedKeys={['overview']}>
                  </Menu>
                </Drawer>
                <Drawer
                  autoFocus={false}
                  //destroyOnClose={true}
                  title={
                    <div style={{ display: 'inline-flex', width: '100%' }}>
                      <span ref={descr} className='descr'>{activeInput.descr}</span>
                      <div className='sel' style={{ position: 'absolute', opacity: 0, height: 0, overflow: 'hidden', whiteSpace: 'pre' }}><span className="text" ref={span}>{bufferKeyboard}</span></div>
                      <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
                        {activeInput.showInput ? <Input style={{ color: "#005092", width: inputWidth, marginLeft: 185 - (descr.current?.offsetWidth ? descr.current?.offsetWidth : 0) }} size='small' value={bufferKeyboard} bordered={false} /> : <Input.Password style={{ color: "#005092", width: inputWidth, marginLeft: 185 - (descr.current?.offsetWidth ? descr.current?.offsetWidth : 0) }} size='small' value={bufferKeyboard} bordered={false} visibilityToggle={false} />}
                      </Space>
                    </div>
                  }
                  placement="bottom"
                  height={keyboardCollapse ? 41 : 376}
                  mask={true}
                  maskStyle={{ backgroundColor: "inherit", opacity: 0 }}
                  maskClosable={true}
                  visible={activeInput.showKeyboard}
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
                      'username': /^[\p{L}\s]*$/gu,
                      'phonenumber': /^[0-9]{1,15}$/,
                      'email': /^[a-zA-Z0-9.!@#$%&’*+/=?^_`{|}~-]*$/,
                      'float': /[+-]?([0-9\.\,])+/,
                      'ip': /^[0-9\.]{1,15}$/,
                      'dec-': /^-?(0|[1-9]\d*)$/,
                      'dec+': /^(0|[1-9]\d*)$/,
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
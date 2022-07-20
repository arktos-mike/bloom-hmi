import React, { useState, useEffect, useRef } from 'react'
import logo from '/icon.svg'
import 'styles/app.css'
import { HashRouter, Route, Link, Routes } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { Layout, Menu, Select, Drawer, Button, Modal, Input, Form, Checkbox, notification, DatePicker, TimePicker, ConfigProvider } from 'antd';
import { EyeOutlined, ToolOutlined, SettingOutlined, UserOutlined, LockOutlined, ApartmentOutlined, SendOutlined, AlertOutlined } from '@ant-design/icons';
import { useIdleTimer } from 'react-idle-timer'
import rulocale from 'antd/lib/locale/ru_RU';
import trlocale from 'antd/lib/locale/tr_TR';
import eslocale from 'antd/lib/locale/es_ES';
import enlocale from 'antd/lib/locale/en_US';
import './i18n/config';
import { useTranslation } from 'react-i18next';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const App: React.FC = () => {

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
    openNotificationWithIcon('warning', t('notifications.idle'), 0);
  }

  const idleTimer = useIdleTimer({
    onIdle,
    timeout: 1000 * 60 * 5,
    debounce: 250
  })

  const { t, i18n } = useTranslation();

  const [lngs, setLngs] = useState({ data: [] })
  const [state, setState] = useState({ data: [] })
  const [today, setDate] = useState(new Date())
  const [visible, setVisible] = useState(false)

  const showDrawer = () => {
    setVisible(!visible);
  }

  const lngChange = async (lang: string) => {
    try {
      i18n.changeLanguage(lang)
      await fetch('http://localhost:3000/locales/' + lang, {
        method: 'PATCH',
      });
    }
    catch (error) { console.log(error); }
  }

  const curDate = today.toLocaleDateString(i18n.language, { day: 'numeric', month: 'numeric', year: 'numeric', });
  const curTime = `${today.toLocaleTimeString(i18n.language, { hour: 'numeric', minute: 'numeric', second: 'numeric' })}\n\n`;

  useEffect(() => {
    const timer = setInterval(() => { // Creates an interval which will update the current data every minute
      // This will trigger a rerender every component that uses the useDate hook.
      setDate(new Date());
    }, 1000);
    return () => {
      clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, []);

  const fetchLngs = async () => {
    try {
      const response = await fetch('http://localhost:3000/locales');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setLngs({ data: json });
    }
    catch (error) { console.log(error); }
  }

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      setState({ data: json });
    }
    catch (error) { console.log(error); }
  }

  useEffect(() => {
    fetchData()
  }, [state])

  useEffect(() => {
    fetchLngs()
  }, [])

  return (
    <div>
      <HashRouter>
        <Layout className="layout">
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0, display: 'inline-flex', justifyContent: "space-between" }}>
            <div className="logo" onClick={showDrawer}>
              <img src={logo} className="applogo" alt=""></img>
            </div>
            <Menu style={{
              fontSize: '150%'
            }} theme='dark' mode="horizontal">
              <Menu.Item key="overview">
                <Link to="/"><EyeOutlined style={{ fontSize: '100%' }} /></Link>
              </Menu.Item>
              <Menu.Item key="control" >
                <Link to="/control"><ToolOutlined style={{ fontSize: '100%' }} /></Link>
              </Menu.Item>
              <Menu.Item key="settings" >
                <Link to="/settings"><SettingOutlined style={{ fontSize: '100%' }} /></Link>
              </Menu.Item>
            </Menu>
            <div className="mode" style={{ backgroundColor: '#00000000' }}>
            </div>
            <div className="user">
              <Button type="primary" size="large" shape="circle" icon={<UserOutlined style={{ fontSize: '120%' }} />} /><span className="text"></span>
            </div>
            <div className="lang">
              <Select optionLabelProp="label" value={i18n.language} size="large" dropdownStyle={{ fontSize: '40px !important' }} dropdownAlign={{ offset: [-40, 4] }} dropdownMatchSelectWidth={false} style={{ color: "white" }} onChange={lngChange} bordered={false}>
              {(lngs.data || []).map(lng => (
                <Option key={lng['locale']} value={lng['locale']} label={String(lng['locale']).toUpperCase()}>
                  <div>{String(lng['locale']).toUpperCase()} - {t('self',{lng:lng['locale']})}</div></Option>
                ))}
              </Select>
            </div>
            <div className="time">
              {curTime}{curDate}
            </div>
          </Header>
          <div className="site-drawer-render-in-current-wrapper">
            <Content className="content">
              <div className="site-layout-content">
                <Drawer
                  //title="Basic Drawer"
                  placement="left"
                  closable={false}
                  visible={visible}
                  getContainer={false}
                  style={{ position: 'absolute', }}
                  bodyStyle={{ margin: "0px", padding: "0px" }}
                >
                  <Menu style={{ fontSize: '150%' }} mode="inline">
                    <Menu.Item key="overview" icon={<EyeOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/"></Link>
                    </Menu.Item>
                    <Menu.Item key="control" icon={<ToolOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/control"></Link>
                    </Menu.Item>
                    <Menu.Item key="production" icon={<ToolOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/production"></Link>
                    </Menu.Item>
                    <Menu.Item key="projectile" icon={<SendOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/projectile"></Link>
                    </Menu.Item>
                    <Menu.Item key="settings" icon={<SettingOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/settings"></Link>
                    </Menu.Item>
                    <Menu.Item key="alarms" icon={<AlertOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/alarms"></Link>
                    </Menu.Item>
                    <Menu.Item key="system" icon={<ApartmentOutlined style={{ fontSize: '100%' }} />}>
                      <Link to="/system"></Link>
                    </Menu.Item>
                  </Menu>
                </Drawer>
                <div><h1>{t('menu.production')}</h1>
                  <div>
                    <ol>
                      {
                        (state.data || []).map(tag => (
                          <li key={tag['tag']['name']} style={{ textAlign: 'start' }}>
                            <code>{tag['tag']['name']}</code>&emsp;<b>{Number(tag['val']).toFixed(tag['tag']['dec'])}</b>&emsp;{new Date(tag['updated']).toLocaleDateString("ru-RU", {
                              year: 'numeric', month: 'numeric', day: 'numeric',
                              hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3,
                              hour12: false, timeZone: 'Europe/Moscow'
                            })}
                          </li>
                        ))
                      }
                    </ol>
                  </div>
                </div>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center', margin: '0px', padding: '3px', color: 'rgba(0, 0, 0, 0.45)' }}></Footer>
          </div>
        </Layout>
      </HashRouter >
    </div >
  )
}

export default App

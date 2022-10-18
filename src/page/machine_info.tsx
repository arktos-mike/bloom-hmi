import { Card, Col, Form, Row, Skeleton } from 'antd';
import React, { useState, useEffect } from 'react'
import { ShoppingCartOutlined, BarcodeOutlined, FieldNumberOutlined, HistoryOutlined, SyncOutlined } from '@ant-design/icons';
import { FabricPieceIcon } from "../components/Icons"
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

const MachineInfo: React.FC = () => {

  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ type: '', serialno: '', mfgdate: '', picks: 0, cloth: 0, motor: '' })
  const [loading, setLoading] = useState(true)
  let isSubscribed = true;

  const duration2text = (int: any) => {
    let diff = dayjs.duration(int);
    return (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
  }

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/machine');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      if (isSubscribed) { setState(json[0]); setLoading(false) }
    }
    catch (error) { console.log(error); }
  }

  useEffect(() => {
    dayjs.locale(i18n.language)
    fetchData()
    return () => { isSubscribed = false }
  }, [state])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%' }}>
        <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.lifetime')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} size='large' style={{ width: '50%' }} colon={false}>
              <Skeleton loading={loading} round avatar active>
                <Form.Item label={<BarcodeOutlined style={{ fontSize: '150%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{state['type']}</span>
                </Form.Item>
                <Form.Item label={<FieldNumberOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{state['serialno']}</span>
                </Form.Item>
                <Form.Item label={<ShoppingCartOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{state['mfgdate'] && dayjs(state['mfgdate']).format("LL")}</span>
                </Form.Item>
                <Form.Item label={<SyncOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{state['picks'] > 0 && (state['picks'] + ' ' + t('tags.planClothDensity.eng').split('/')[0])}</span>
                </Form.Item>
                <Form.Item label={<FabricPieceIcon style={{ fontSize: '220%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{state['cloth'] > 0 && (Number(Number(state['cloth']).toFixed(2).toString()).toLocaleString(i18n.language) + ' ' + t('tags.planClothDensity.eng')?.split('/')[1]?.slice(-1))}</span>
                </Form.Item>
                <Form.Item label={<HistoryOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{duration2text(state['motor'])}</span>
                </Form.Item>
              </Skeleton>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MachineInfo

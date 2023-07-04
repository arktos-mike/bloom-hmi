import { Card, Col, Form, Row, Skeleton } from 'antd';
import React, { useState, useEffect } from 'react'
import { ShoppingCartOutlined, BarcodeOutlined, FieldNumberOutlined, HistoryOutlined, SyncOutlined } from '@ant-design/icons';
import { FabricPieceIcon } from "../components/Icons"
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const cardStyle = { background: "whitesmoke", width: '100%', display: 'flex', flexDirection: 'column' as 'column' }
const cardHeadStyle = { background: "#1890ff", color: "white" }
const cardBodyStyle = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as 'column' }

type Props = {
  lifetime: any;
  tags: any;
  modeCode: any;
};
const MachineInfo: React.FC<Props> = ({
  lifetime,
  tags,
  modeCode
}) => {

  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true)

  const duration2text = (diff: any) => {
    let durstr = (diff.days() > 0 ? diff.days() + " " + t('shift.days') + " " : "") + (diff.hours() > 0 ? diff.hours() + " " + t('shift.hours') + " " : "") + (diff.minutes() > 0 ? diff.minutes() + " " + t('shift.mins') + " " : "") + (diff.seconds() > 0 ? diff.seconds() + " " + t('shift.secs') : "")
    if (durstr == "") durstr = "<1 " + t('shift.secs')
    return durstr
  }

  const getTagVal = (tagName: string) => {
    let obj = tags.find((o: any) => o['tag']['name'] == tagName)
    if (obj) { return Number(obj['val']); }
    else { return null };
  }

  useEffect(() => {
    (async () => {
      dayjs.locale(i18n.language == 'en' ? 'en-gb' : i18n.language)
      setLoading(false);
    })();
    return () => { }
  }, [])

  return (
    <div className='wrapper'>
      <Row gutter={[8, 8]} style={{ flex: '1 1 100%' }}>
        <Col span={24} style={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch' }}>
          <Card title={t('panel.lifetime')} bordered={false} size='small' style={cardStyle} headStyle={cardHeadStyle} bodyStyle={cardBodyStyle}>
            <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} size='large' style={{ width: '50%' }} colon={false}>
              <Skeleton loading={loading} round avatar active>
                <Form.Item label={<BarcodeOutlined style={{ fontSize: '150%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{lifetime?.type}</span>
                </Form.Item>
                <Form.Item label={<FieldNumberOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{lifetime?.serialno}</span>
                </Form.Item>
                <Form.Item label={<ShoppingCartOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{lifetime?.mfgdate && dayjs(lifetime?.mfgdate).format("LL")}</span>
                </Form.Item>
                <Form.Item label={<SyncOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{lifetime?.picks > 0 && ((lifetime?.picks + Math.round(getTagVal('picksLastRun') || 0)) + ' ' + t('tags.planClothDensity.eng').split('/')[0])}</span>
                </Form.Item>
                <Form.Item label={<FabricPieceIcon style={{ fontSize: '220%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{lifetime?.cloth > 0 && (Number(Number((modeCode?.val == 1) ? lifetime?.cloth + Number(getTagVal('picksLastRun')) / (100 * Number(getTagVal('planClothDensity'))) : lifetime?.cloth).toFixed(2).toString()).toLocaleString(i18n.language) + ' ' + t('tags.planClothDensity.eng')?.split('/')[1]?.slice(-1))}</span>
                </Form.Item>
                <Form.Item label={<HistoryOutlined style={{ fontSize: '200%', color: "#1890ff" }} />} >
                  <span style={{ fontSize: '24px' }}>{duration2text((modeCode?.val == 1) ? dayjs.duration(lifetime?.motor).add(dayjs().diff(modeCode?.updated)) : dayjs.duration(lifetime?.motor))}</span>
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

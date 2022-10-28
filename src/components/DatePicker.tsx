import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import { notification } from "antd";
import { useTranslation } from 'react-i18next';
const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
const Component = (props: any) => {
  const { t } = useTranslation();
  const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
    if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
      notification[type]({
        message: message,
        description: descr,
        placement: 'bottomRight',
        duration: dur,
        style: style,
      });
  }
  if (props.userRights && (props.token ? props.userRights.includes(JSON.parse(Buffer.from(props.token.split('.')[1], 'base64').toString()).role) ? false : true : true)) {
    return (<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }}>
      <DatePicker disabled showTime={props.showTime} size="large" style={{ width: '100%' }} format={props.format || 'L'} defaultValue={props.defaultValue} onChange={props.onChange} />
    </div>);
  }
  return (
    <DatePicker size="large" showTime={props.showTime} style={{ width: '100%' }} format={props.format || 'L'} status={props.status} defaultValue={props.defaultValue} picker={props.picker} onChange={props.onChange} />
  );
}
export default Component;

import { Checkbox, notification } from "antd";
import { useTranslation } from 'react-i18next';

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
    return (
      //<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Checkbox defaultChecked={props.defaultChecked ? props.defaultChecked : null} checked={props.checked ? props.checked : null} style={props.style} onChange={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }}>{t(props.text)}</Checkbox>
      //  </div>
    );
  }
  return (
    // <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
    <Checkbox defaultChecked={props.defaultChecked ? props.defaultChecked : null} checked={props.checked ? props.checked : null} style={props.style} onChange={props.onChange}>{t(props.text)}</Checkbox>
    //</div>
  );
}
export default Component;

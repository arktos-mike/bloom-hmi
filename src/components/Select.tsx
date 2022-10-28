import { Select, notification } from "antd";
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
    return (<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }}>
      <Select size="large" className="narrow"
        defaultValue={props.defaultValue}
        value={props.tag?.val ? props.tag?.val : props.value}
        options={props.options}
        style={{ width: "100%", textAlign: "left" }}
        disabled
      />
    </div>);
  }
  return (
    <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Select size="large" className="narrow"
        defaultValue={props.defaultValue}
        value={props.tag?.val ? props.tag?.val : props.value}
        onChange={props.onChange}
        options={props.options}
        style={{ width: "100%", textAlign: "left" }}
        status={props.status}
      />
    </div>
  );

}
export default Component;

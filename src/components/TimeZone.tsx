import { notification } from "antd";
import { useTranslation } from 'react-i18next';
import TimezoneSelect from 'react-timezone-select'

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
      <TimezoneSelect
        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        isDisabled={true}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            borderWidth: 2,
            borderRadius: 10,
            width: '100%'
          }),
        }}
      />
    </div>);
  }
  return (
    <TimezoneSelect
      value={props.value ? props.value : Intl.DateTimeFormat().resolvedOptions().timeZone}
      onChange={props.onChange}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          borderWidth: 2,
          borderRadius: 10,
          width: '100%'
        }),
      }}
    />
  );
}
export default Component;

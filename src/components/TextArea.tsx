import { Input, notification, Spin } from "antd";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

const Component = (props: any) => {
  useEffect(() => {
    props.onUpdate && props.onUpdate(props.value);
  }, [props.value]);
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
      <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true} size="small">
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }}>
          <TextArea size="large"
            className={props.className ? props.className : null}
            prefix={props.prefix}
            defaultValue={props.defaultValue}
            value={props.tag?.val ? props.tag?.val : props.value}
            placeholder={t(props.placeholder)}
            style={{ width: "100%" }}
            disabled
            autoSize
          />
        </div>
      </Spin>
    );
  }
  return (
    <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true} size="small">
      <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TextArea size="large"
          className={props.className ? props.className : null}
          prefix={props.prefix}
          defaultValue={props.defaultValue}
          value={props.tag?.val ? props.tag?.val : props.value}
          placeholder={t(props.placeholder)}
          onChange={props.onChange}
          onFocus={props.onFocus}
          style={{ width: "100%" }}
          status={props.status}
          autoSize
        />
      </div>
    </Spin>
  );

}
export default Component;

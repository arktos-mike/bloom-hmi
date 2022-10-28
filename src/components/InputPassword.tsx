import { Input, notification, Spin } from "antd";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

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
          <Input.Password size="large"
            addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
            addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
            prefix={props.prefix}
            defaultValue={props.defaultValue}
            value={props.tag?.val ? props.tag?.val : props.value}
            placeholder={t(props.placeholder)}
            visibilityToggle={props.visibilityToggle}
            style={{ width: "100%" }}
            disabled
          />
        </div>
      </Spin>
    );
  }
  return (
    <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true} size="small">
      <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Input.Password size="large"
          addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
          addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
          prefix={props.prefix}
          visibilityToggle={props.visibilityToggle}
          defaultValue={props.defaultValue}
          value={props.tag?.val ? props.tag?.val : props.value}
          placeholder={t(props.placeholder)}
          onChange={props.onChange}
          onFocus={props.onFocus}
          style={{ width: "100%" }}
          status={props.status}
        />
      </div>
    </Spin>
  );

}
export default Component;

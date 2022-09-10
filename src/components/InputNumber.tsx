import { InputNumber, notification } from "antd";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {
  useEffect(() => {
    props.onUpdate && props.onUpdate(parseFloat(props.value?.replace(',','.').replace(' ','')).toLocaleString('en'));
  }, [props.value]);
  const { t, i18n } = useTranslation();
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
    return (<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2); }}>
      <InputNumber size="large"
        className={props.className ? props.className : null}
        addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
        addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
        prefix={props.prefix}
        defaultValue={props.defaultValue}
        decimalSeparator={t('decimalSeparator')}
        value={parseFloat(props.value?.replace(',','.').replace(' ','')).toLocaleString(i18n.language)}
        placeholder={t(props.placeholder)}
        style={{ width: "100%", textAlign: "right" }}
        controls={props.controls}
        disabled
      />
    </div>);
  }
  return (
    <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <InputNumber size="large"
        className={props.className ? props.className : null}
        addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
        addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
        prefix={props.prefix}
        defaultValue={props.defaultValue}
        decimalSeparator={t('decimalSeparator')}
        value={parseFloat(props.value?.replace(',','.').replace(' ','')).toLocaleString(i18n.language)}
        placeholder={t(props.placeholder)}
        onChange={props.onChange}
        onFocus={props.onFocus}
        controls={props.controls}
        style={{ width: "100%", textAlign: "right" }}
        status={props.status}
      />
    </div>
  );

}
export default Component;

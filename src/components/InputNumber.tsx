import { InputNumber, notification, Spin } from "antd";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {

  function localeParseFloat(str: String) {
    let out: String[] = [];
    let thousandsSeparator = Number(10000).toLocaleString(i18n.language).charAt(2)
    str.split(Number(1.1).toLocaleString(i18n.language).charAt(1)).map(function (x) {
      x = x.replace(thousandsSeparator, "");
      out.push(x);
    })
    return parseFloat(out.join("."));
  }

  useEffect(() => {
    props.value != null && props.onUpdate && props.onUpdate(localeParseFloat(props.value));
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
    return (
      <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true} size="small" >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }}>
          <InputNumber size="large"
            className={props.className ? props.className : null}
            addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
            addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
            prefix={props.prefix}
            defaultValue={props.defaultValue}
            decimalSeparator={t('decimalSeparator')}
            value={props.value}
            placeholder={t(props.placeholder)}
            style={{ width: "100%" }}
            controls={props.controls}
            status={props.status ? props.status : (props.value != null && props.tag?.min && props.tag?.max && (localeParseFloat(props.value) < props.tag?.min || localeParseFloat(props.value) > props.tag?.max)) ? 'error' : null}
            disabled
          />
        </div>
      </Spin>
    );
  }
  return (
    <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true} size="small" >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <InputNumber size="large"
          className={props.className ? props.className : null}
          addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
          addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
          prefix={props.prefix}
          defaultValue={props.defaultValue}
          decimalSeparator={t('decimalSeparator')}
          value={props.value}
          placeholder={t(props.placeholder)}
          onChange={props.onChange}
          onFocus={props.onFocus}
          style={{ width: "100%" }}
          controls={props.controls}
          status={props.status ? props.status : (props.value != null && props.tag?.min && props.tag?.max && (localeParseFloat(props.value) < props.tag?.min || localeParseFloat(props.value) > props.tag?.max)) ? 'error' : null}
        />
      </div>
    </Spin>
  );

}
export default Component;

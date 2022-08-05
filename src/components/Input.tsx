import { Input, notification } from "antd";
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
        return (<div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2); }}>
            <Input size="large"
                addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
                addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
                prefix={props.prefix}
                value={props.tag ? props.tag?.val : props.value}
                placeholder={t(props.placeholder)}
                style={{ width: "100%", textAlign: "right" }}
                disabled
            />
        </div>);
    }
    return (
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Input size="large"
                addonBefore={props.descr ? props.tag === null ? props.descr : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr') : null}
                addonAfter={props.eng ? props.tag === null ? props.eng : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng') : null}
                prefix={props.prefix}
                value={props.tag ? props.tag?.val : props.value}
                placeholder={t(props.placeholder)}
                onChange={props.onChange}
                onFocus={props.onFocus}
                style={{ width: "100%", textAlign: "right" }}
            />
        </div>
    );

}
export default Component;
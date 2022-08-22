import { notification, Radio } from "antd";
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
            <Radio.Group onChange={()=>{openNotificationWithIcon('error', t('notifications.rightserror'), 2);}} value={props.tag === null ? null : props.tag.val} buttonStyle='solid' size="large" >
                {[...Array.from({ length: props.options.length }, (v, i) => i)].map(i => (
                    <Radio.Button key={props.options[i].key} value={props.options[i].key} >
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between' }}>{props.options[i].icon ? props.options[i].icon : null}{t(props.options[i].text)}</div>
                    </Radio.Button>
                ))}
            </Radio.Group>
        );
    }
    return (
        <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
            <Radio.Group onChange={(e) => { props.onChange(e.target.value) }} value={props.tag === null ? null : props.tag.val} buttonStyle='solid' size="large" >
                {[...Array.from({ length: props.options.length }, (v, i) => i)].map(i => (
                    <Radio.Button key={props.options[i].key} value={props.options[i].key} >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{props.options[i].icon ? props.options[i].icon : null}{t(props.options[i].text)}</div>
                    </Radio.Button>
                ))}
            </Radio.Group>
        </div>
    );
}
export default Component;
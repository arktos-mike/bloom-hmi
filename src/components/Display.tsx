import { Card, Checkbox, notification, Statistic } from "antd";
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {
    const { t } = useTranslation();
    
    return (
        <Card style={props.fullSize ? { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { flex: '1 1 100%', alignSelf: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} bodyStyle={{ padding: "0px 15px" }}>
            <Statistic    
                groupSeparator=' '
                decimalSeparator={t('decimalSeparator')}
                precision={props.tag === null ? 0 : props.tag.dec}
                title={props.noDescr ? null : props.tag === null ? "--" : t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.descr')}
                value={props.tag === null ? "--" : props.tag.val}
                prefix={props.icon}
                suffix={props.noEng ? null : props.tag === null ? <span>--</span> : <span> {t('tags.' + props.tag.name.replace(/[0-9]/g, '') + '.eng')}</span>}
            />
            {props.dtReset ? <span className='ant-statistic-title'>{props.dtReset}</span> : null}
        </Card>
    );
}
export default Component;
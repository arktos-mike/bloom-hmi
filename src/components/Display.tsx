import { Card, Spin, Statistic } from "antd";
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {
  const { t } = useTranslation();

  return (
    <Card style={props.fullSize ? { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { flex: '1 1 100%', alignSelf: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} bodyStyle={{ padding: "0px 15px" }}>
      <Spin spinning={(props.tag?.link == null || props.tag?.link == true) ? false : true } size="small">
        <Statistic
          groupSeparator=' '
          decimalSeparator={t('decimalSeparator', '')}
          precision={props.tag?.dec}
          title={props.noDescr ? null : t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.descr', '')}
          value={props.value}
          prefix={props.icon}
          suffix={props.noEng ? null : props.suffix ? <span>{'/ ' + props.suffix + ' ' + t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng', '')}</span> : <span> {t('tags.' + props.tag?.name.replace(/[0-9]/g, '') + '.eng', '')}</span>}
        />
        {props.dtReset ? <span className='ant-statistic-title'>{props.dtReset}</span> : null}
      </Spin>
    </Card>
  );
}
export default Component;

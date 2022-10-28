import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import * as React from 'react';
import { PickerTimeProps } from 'antd/es/date-picker/generatePicker';
import { notification } from "antd";
import { useTranslation } from 'react-i18next';

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> { }

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => {
  return <DatePicker {...props} picker="time" mode={undefined} ref={ref} />;
});

TimePicker.displayName = 'TimePicker';

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
      <TimePicker disabled defaultValue={props.defaultValue} onChange={props.onChange} format={props.format} size="large" style={{ width: '100%' }} />
    </div>);
  }
  return (
    <TimePicker minuteStep={props.minuteStep} defaultValue={props.defaultValue} showNow={props.showNow} onChange={props.onChange} format={props.format} size="large" style={{ width: '100%' }} status={props.status} />
  );
}
export default Component;

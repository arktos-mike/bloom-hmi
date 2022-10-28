import { Button, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Component = (props: any) => {
  const { t } = useTranslation();
  const confirm = (onOk: any) => {
    Modal.confirm({
      title: t('confirm.title'),
      icon: <ExclamationCircleOutlined style={{ fontSize: "300%" }} />,
      content: t('confirm.descr'),
      okText: t('confirm.ok'),
      cancelText: t('confirm.cancel'),
      centered: true,
      okButtonProps: { size: 'large', danger: true },
      cancelButtonProps: { size: 'large' },
      onOk: onOk,
    });
  };
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
      <Button shape={props.shape} danger={props.danger} style={props.style} onClick={() => { openNotificationWithIcon('error', t('notifications.rightserror'), 2, '', { backgroundColor: '#fff2f0', border: '2px solid #ffccc7' }); }} type="primary" icon={props.icon} size='large' >{t(props.text)}</Button>
    );
  }
  return (
    <Button shape={props.shape} danger={props.danger} style={props.style} onMouseDown={props.onPress} onTouchStart={props.onPress} onMouseUp={props.onRelease} onMouseLeave={props.onRelease} onTouchEnd={props.onRelease} onClick={() => { props.confirm ? confirm(props.onClick) : props.onClick && props.onClick() }} type="primary" icon={props.icon} htmlType={props.htmlType} size='large' >{t(props.text)}</Button>
  );
}
export default Component;

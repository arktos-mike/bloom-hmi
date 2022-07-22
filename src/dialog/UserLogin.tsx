import { ChangeEvent, FormEvent } from 'react'
import { Modal, Button, Form, Input, Checkbox, notification } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


type Props = {
    isModalVisible: boolean;
    token: string;
    setIsModalVisible: (val: boolean) => void;
};
const UserLogin: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible,
    token
}) => {
    const [form] = Form.useForm()

    const openNotificationWithIcon = (type: string, message: string, dur: number, descr?: string, style?: React.CSSProperties) => {
        if (type == 'success' || type == 'warning' || type == 'info' || type == 'error')
          notification[type]({
            message: message,
            description: descr,
            placement: 'bottomRight',
            duration: dur,
            style: style,
          });
      };
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }
    const handleOk = () => {
        form.resetFields()
    }
    const onFinish = async (values: { user: any; password: any; remember: any; }) => {
        console.log('Form submited!', values.user, values.password, values.remember)
        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json;charset=UTF-8', },
                body: JSON.stringify({ name: values.user, password: values.password, }),
            });
            const json = await response.json();
            token = json.token
            openNotificationWithIcon('info', json.message, 0);
            if (!response.ok) { throw Error(response.statusText); }


        }
        catch (error) { console.log(error) }
        setIsModalVisible(false)
    }

    return (
        <Modal
            title={t('user.signin')}
            okButtonProps={{ size: 'large' }}
            okText={t('user.logout')}
            cancelButtonProps={{ size: 'large' }}
            onOk={handleOk}
            onCancel={handleCancel}
            visible={isModalVisible}
            destroyOnClose={true}
            centered={true}
            afterClose={handleCancel}
        >
            <div className="sel">
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: false }}
                    size='large'
                    onFinish={onFinish}
                    form={form}
                    preserve={false}
                >
                    <Form.Item
                        label={t('user.curuser')}
                    >
                        <span className="text">{t('user.user' )}</span>
                    </Form.Item>
                    <Form.Item
                        label={t('user.user')}
                        name="user"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input placeholder={t('user.user')} value={''} size="large" />
                    </Form.Item>

                    <Form.Item
                        label={t('user.password')}
                        name="password"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={false} value={''} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                        <Checkbox>{t('user.remember')}</Checkbox>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="link" onClick={() => { }}>{t('user.change')}</Button>
                    </Form.Item >
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button size="large" type="primary" htmlType="submit" >
                            {t('user.login')}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}
export default UserLogin;
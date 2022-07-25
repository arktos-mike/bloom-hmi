import { Modal, Button, Form, Input, InputNumber, Select, notification } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

type Props = {
    isModalVisible: boolean;
    setIsModalVisible: (val: boolean) => void;
};
const UserRegister: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible
}) => {
    const [form] = Form.useForm()
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }
    
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
    const onFinish = async (values: { user: any; password: any; email: any; phone: any; role: any; }) => {
        try {
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: { 'content-type': 'application/json;charset=UTF-8', },
                body: JSON.stringify({name: values.user, email: values.email, phonenumber: values.phone, role: values.role, password: values.password }),
            });
            const json = await response.json();
            openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
            if (!response.ok) { throw Error(response.statusText); }
        }
        catch (error) { console.log(error) }
        //setIsModalVisible(false)
    }


    return (
        <Modal
            title={t('user.register')}
            okText={t('menu.close')}
            okButtonProps={{ size: 'large' }}
            onCancel={handleCancel}
            onOk={handleCancel}
            cancelButtonProps={{ style: { display: "none" } }}
            visible={isModalVisible}
            destroyOnClose={true}
            centered={true}
            afterClose={handleCancel}
        >
            <div className="sel">
                <Form
                    name="change"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    size='large'
                    onFinish={onFinish}
                    form={form}
                    preserve={false}
                >
                    <Form.Item
                        label={t('user.user')}
                        name="user"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input placeholder={t('user.user')} size="large" />
                    </Form.Item>

                    <Form.Item
                        label={t('user.password')}
                        name="password"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={true} placeholder={t('user.password')} size="large" prefix={<LockOutlined className="site-form-item-icon" />} />
                    </Form.Item>

                    <Form.Item
                        label={t('user.email')}
                        name="email"
                        rules={[{ type: 'email', message: t('user.wrongemail') }, { required: false, message: t('user.fill') }]}
                    >
                        <Input placeholder={t('user.email')} size="large" />
                    </Form.Item>

                    <Form.Item
                        label={t('user.phone')}
                        name="phone"
                        rules={[{ required: false, message: t('user.fill') }]}
                    >
                        <InputNumber addonBefore="+" placeholder={t('user.phone')} style={{ width: '100%' }} size="large" controls={false} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label={t('user.role')}
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Select placeholder={t('user.role')}>
                            <Option value="weaver">{t('user.weaver')}</Option>
                            <Option value="fixer">{t('user.fixer')}</Option>
                            <Option value="manager">{t('user.manager')}</Option>
                            <Option disabled value="sa">{t('user.admin')}</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button size="large" type="primary" htmlType="submit" >
                            {t('user.submit')}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}
export default UserRegister;
import { ChangeEvent, FormEvent } from 'react'
import { Modal, Button, Form, Input, Checkbox } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


type Props = {
    isModalVisible: boolean;
    user?: string;
    password?: string;
    setIsModalVisible: (val: boolean) => void;
};
const UserLogin: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible,
    user,
    password,
}) => {
    const [form] = Form.useForm()
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }
    const handleOk = () => {
        form.submit()
    }
    const onFinish = (values: { user: any; password: any; remember: any; }) => {
        console.log('Form submited!', values.user, values.password, values.remember)
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
                        <span className="text">{t('user.' + user)}</span>
                    </Form.Item>
                    <Form.Item
                        label={t('user.user')}
                        name="user"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input placeholder={t('user.user')} value={user} size="large" />
                    </Form.Item>

                    <Form.Item
                        label={t('user.password')}
                        name="password"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={false} value={password} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
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
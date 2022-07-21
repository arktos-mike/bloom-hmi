import { ChangeEvent, FormEvent } from 'react'
import { Modal, Button, Form, Input } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


type Props = {
    isModalVisible: boolean;
    user?: string;
    oldpassword?: string;
    newpassword?: string;
    setIsModalVisible: (val: boolean) => void;
};
const UserEdit: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible,
    user,
    oldpassword,
    newpassword
}) => {
    const [form] = Form.useForm()
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }

    const onFinish = () => {
        console.log('Form submited!')
        setIsModalVisible(false)
    }

    return (
        <Modal
            title={t('user.change')}
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
                        <Input placeholder={t('user.user')} value={user} size="large" />
                    </Form.Item>

                    <Form.Item
                        label={t('user.oldpassword')}
                        name="oldpassword"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={false} placeholder={t('user.password')} value={oldpassword} size="large" prefix={<LockOutlined className="site-form-item-icon" />} />
                    </Form.Item>

                    <Form.Item
                        label={t('user.newpassword')}
                        name="newpassword"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={false} placeholder={t('user.password')} value={newpassword} size="large" prefix={<LockOutlined className="site-form-item-icon" />} />
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
export default UserEdit;
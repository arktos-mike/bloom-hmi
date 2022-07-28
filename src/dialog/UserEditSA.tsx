import { useEffect, useState } from 'react'
import { Modal, Button, Form, Input, InputNumber, Select, notification } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

type Props = {
    isModalVisible: boolean;
    user: any;
    setIsModalVisible: (val: boolean) => void;
    setShowKeyboard: (val: boolean) => void;
    inputKeyboard: string;
    setInputKeyboard: (val: string) => void;
};
const UserEditSA: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible,
    user,
    setShowKeyboard,
    inputKeyboard,
    setInputKeyboard
}) => {
    const [form] = Form.useForm()
    const [activeField, setActiveField] = useState('')
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }

    useEffect(() => {
        if (form && isModalVisible) {
            form.setFieldsValue({
                id: user.id,
                user: user.name,
                email: user.email,
                phone: user.phonenumber,
                role: user.role
            })
        }
    }, [form, user])

    useEffect(() => {
        if (form && isModalVisible) {
            form.setFieldsValue({ [activeField]: inputKeyboard })
        }
    }, [inputKeyboard])

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
    const onFinish = async (values: { id: any; user: any; password: any; email: any; phone: any; role: any; }) => {
        try {
            const response = await fetch('http://localhost:3000/users/update', {
                method: 'POST',
                headers: { 'content-type': 'application/json;charset=UTF-8', },
                body: JSON.stringify({ id: values.id, name: values.user, email: values.email, phonenumber: values.phone, role: values.role, password: values.password }),
            });
            const json = await response.json();
            openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
            if (!response.ok) { throw Error(response.statusText); }
            setIsModalVisible(false);
        }
        catch (error) { console.log(error) }
        //setIsModalVisible(false)
    }


    return (
        <Modal
            title={t('user.change')}
            cancelText={t('menu.close')}
            cancelButtonProps={{ size: 'large' }}
            onCancel={handleCancel}
            okButtonProps={{ style: { display: 'none' } }}
            visible={isModalVisible}
            destroyOnClose={true}
            //centered={true}
            afterClose={() => setShowKeyboard(false)}
            getContainer={false}
            style={{ top: 20 }}
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
                    initialValues={{
                        id: user.id,
                        user: user.name,
                        email: user.email,
                        phone: user.phonenumber,
                        role: user.role
                    }}
                >
                    <Form.Item
                        label={t('user.id')}
                        name="id"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <InputNumber disabled={true} placeholder={t('user.id')} style={{ width: '100%' }} size="large" controls={false} />
                    </Form.Item>

                    <Form.Item
                        label={t('user.user')}
                        name="user"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input placeholder={t('user.user')} size="large" onChange={e => { setInputKeyboard(e.target.value); }} onFocus={(e) => { setActiveField('user'); setInputKeyboard(e.target.value); setShowKeyboard(true); }} />
                    </Form.Item>

                    <Form.Item
                        label={t('user.password')}
                        name="password"
                        rules={[{ required: false, message: t('user.fill') }]}
                    >
                        <Input.Password visibilityToggle={true} placeholder={t('user.password')} size="large" prefix={<LockOutlined className="site-form-item-icon" />} onChange={e => { setInputKeyboard(e.target.value); }} onFocus={(e) => { setActiveField('password'); setInputKeyboard(e.target.value); setShowKeyboard(true); }} />
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
                        <InputNumber addonBefore="+" placeholder={t('user.phone')} style={{ width: '100%' }} size="large" controls={false} onChange={value => { setInputKeyboard(value.toString()) }} onFocus={(e) => { setActiveField('phone'); setInputKeyboard(e.target.value); setShowKeyboard(true); }} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label={t('user.role')}
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Select disabled={user.role == 'sa' ? true : false} >
                            <Option value="weaver">{t('user.weaver')}</Option>
                            <Option value="fixer">{t('user.fixer')}</Option>
                            <Option value="manager">{t('user.manager')}</Option>
                            <Option disabled value="sa">{t('user.admin')}</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button size="large" type="primary" htmlType="submit" >
                            {t('user.editsubmit')}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}
export default UserEditSA;
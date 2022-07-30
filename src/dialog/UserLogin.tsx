import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Form, Input, Checkbox, notification, Select, InputRef } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import UserEdit from "./UserEdit";
import UserRegister from "./UserRegister";

const { Option } = Select;

type Props = {
    isModalVisible: boolean;
    token: any;
    setToken: (val: any) => void;
    setRemember: (val: boolean) => void;
    setIsModalVisible: (val: boolean) => void;
    setShowKeyboard: (val: boolean) => void;
    inputKeyboard: string;
    setInputKeyboard: (val: string) => void;
};

const UserLogin: React.FC<Props> = ({
    isModalVisible,
    setIsModalVisible,
    token,
    setToken,
    setRemember,
    setShowKeyboard,
    inputKeyboard,
    setInputKeyboard
}) => {

    const [form] = Form.useForm()
    const [state, setState] = useState({ data: [] })
    const [activeField, setActiveField] = useState('')
    const [search, setSearch] = useState('')
    const [editVisible, setEditVisible] = useState(false)
    const [showList, setShowList] = useState(false)
    const [regVisible, setRegVisible] = useState(false)
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3000/users/names');
            if (!response.ok) { throw Error(response.statusText); }
            const json = await response.json();
            setState({ data: json });
        }
        catch (error) { console.log(error); }
    }

    useEffect(() => {
        fetchData()
        if (form && isModalVisible) form.resetFields()
    }, [isModalVisible, editVisible, regVisible])

    useEffect(() => {
        if (form && isModalVisible) {
            if (activeField == 'name') {
                setSearch(inputKeyboard);
            } else {
                form.setFieldsValue({ [activeField]: inputKeyboard })
            }
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
    const { t } = useTranslation();
    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }
    const handleOk = () => {
        form.resetFields()
        setToken(null);
    }

    const onFinish = async (values: { user: any; password: any; remember: boolean; }) => {
        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: { 'content-type': 'application/json;charset=UTF-8', },
                body: JSON.stringify({ name: values.user, password: values.password, }),
            });
            const json = await response.json();
            setToken(json.token || null);
            setRemember(values.remember);
            openNotificationWithIcon(json.error ? 'warning' : 'success', t(json.message), 3);
            if (!response.ok) { throw Error(response.statusText); }
        }
        catch (error) { console.log(error) }
        //setIsModalVisible(false)
    }

    return (
        <Modal
            title={t('user.signin')}
            okButtonProps={{ size: 'large' }}
            okText={t('user.logout')}
            cancelText={t('menu.close')}
            cancelButtonProps={{ size: 'large' }}
            onOk={handleOk}
            onCancel={handleCancel}
            visible={isModalVisible}
            destroyOnClose={true}
            //centered={true}
            afterClose={() => { setShowKeyboard(false); setShowList(false) }}
            getContainer={false}
            style={{ top: 20 }}
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
                        <span className="text" style={{ color: token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'fixer' ? "#108ee9" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'weaver' ? "#87d068" : JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role == 'manager' ? "#2db7f5" : "#f50" : "" }}>{token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).name : t('user.anon')}</span>
                    </Form.Item>
                    <Form.Item
                        label={t('user.user')}
                        name="user"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Select showSearch open={showList} searchValue={search} onFocus={() => { setActiveField('name'); setInputKeyboard(search); if (!showList || (showList && search)) { setShowKeyboard(true); setShowList(true); }}} onSearch={(value) => { setSearch(value); }} onSelect={(val:string) => { setSearch(val); setShowList(false); setShowKeyboard(false) }} filterOption={(input, option) => (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        } placeholder={t('user.user')} virtual={true} size="large" suffixIcon={<UserOutlined style={{ fontSize: '120%' }} />}>
                            {(state.data || []).map(user => (
                                <Option key={user['name']} value={user['name']} label={user['name']}>
                                    {user['name']}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t('user.password')}
                        name="password"
                        rules={[{ required: true, message: t('user.fill') }]}
                    >
                        <Input.Password onChange={e => { setInputKeyboard(e.target.value); }} onFocus={(e) => { setActiveField('password'); setInputKeyboard(e.target.value); setShowKeyboard(true); }} visibilityToggle={true} placeholder={t('user.password')} prefix={<LockOutlined className="site-form-item-icon" />} />
                    </Form.Item>
                    <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                        <Checkbox>{t('user.remember')}</Checkbox>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }} hidden={!token} >
                        <Button type="link" onClick={() => { setEditVisible(true); }}>{t('user.change')}</Button>
                        <UserEdit isModalVisible={editVisible} setIsModalVisible={setEditVisible} token={token} setToken={setToken} setShowKeyboard={setShowKeyboard} inputKeyboard={inputKeyboard} setInputKeyboard={setInputKeyboard} />
                    </Form.Item >
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button size="large" type="primary" htmlType="submit" >
                            {t('user.login')}
                        </Button>
                    </Form.Item>
                    {token && <Form.Item wrapperCol={{ offset: 8, span: 16 }} >
                        <Button type="link" onClick={() => { setRegVisible(true); }}>{t('user.register')}</Button>
                        <UserRegister isModalVisible={regVisible} setIsModalVisible={setRegVisible} setShowKeyboard={setShowKeyboard} inputKeyboard={inputKeyboard} setInputKeyboard={setInputKeyboard} token={token} />
                    </Form.Item >}
                </Form>
            </div>
        </Modal>
    )
}
export default UserLogin;
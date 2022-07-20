import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {

  const { t } = useTranslation();

  return (
    <div>
      <div><h1>{t('menu.settings')}</h1>
      </div>
    </div>
  )
}

export default Settings
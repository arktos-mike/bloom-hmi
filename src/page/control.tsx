import { useTranslation } from 'react-i18next';

const Control: React.FC = () => {

  const { t } = useTranslation();


  return (
    <div>
      <div><h1>{t('menu.control')}</h1>
      </div>
    </div>
  )
}

export default Control
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';

const Overview: React.FC = () => {

  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ data: [] })
  let isSubscribed = true;
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/tags');
      if (!response.ok) { throw Error(response.statusText); }
      const json = await response.json();
      if (isSubscribed) setState({ data: json });
    }
    catch (error) { console.log(error); }
  }

  useEffect(() => {
    fetchData()
    return () => { isSubscribed = false }
  }, [state])

  return (
    <div>
      <div><h1>{t('menu.overview')}</h1>
        <div>
          <ol>
            {
              (state.data || []).map(tag => (
                <li key={tag['tag']['name']} style={{ textAlign: 'start' }}>
                  <code>{tag['tag']['name']}</code>&emsp;<b>{Number(tag['val']).toFixed(tag['tag']['dec'])}</b>&emsp;{new Date(tag['updated']).toLocaleDateString(i18n.language, {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 3,
                    hour12: false, timeZone: 'Europe/Moscow'
                  })}
                </li>
              ))
            }
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Overview
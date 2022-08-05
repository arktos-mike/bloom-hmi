import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
//import './samples/node-api'
import 'styles/index.css'
import 'dayjs/locale/ru'
import 'dayjs/locale/es'
import 'dayjs/locale/tr'
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
import { HashRouter } from 'react-router-dom'
dayjs.extend(localizedFormat);

ReactDOM.render(
  <React.StrictMode>
    <HashRouter><App /></HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

postMessage({ payload: 'removeLoading' }, '*')

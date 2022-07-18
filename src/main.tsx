import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// import './samples/node-api'
import 'styles/index.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>, 
  document.getElementById('root')
)

postMessage({ payload: 'removeLoading' }, '*')

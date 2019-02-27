import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './scripts/App.jsx';
import * as serviceWorker from './serviceWorker';
import store from './scripts/Store';

ReactDOM.render(<App store={store}/>, document.getElementById('root'));
serviceWorker.register();

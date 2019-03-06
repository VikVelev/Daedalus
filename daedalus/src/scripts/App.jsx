import React, { Component } from 'react';
import { BrowserRouter as Router , Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';

import NotFound from './pages/NotFound.jsx';
import Main from './pages/Main.jsx';

import 'semantic-ui-css/semantic.min.css';
import '../styles/App.css';

@observer
class App extends Component {

	routes = {
		Main: <Main store={this.props.store}></Main>,
		NotFound: <NotFound></NotFound>
	}

	render() {
		return this.routes.Main;
	}
}

export default App;

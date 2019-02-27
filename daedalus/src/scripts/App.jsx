import React, { Component } from 'react';
import { BrowserRouter as Router , Route, Switch } from 'react-router-dom';

import NotFound from './pages/NotFound.jsx';
import Main from './pages/Main.jsx';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import 'semantic-ui-css/semantic.min.css';
import '../styles/App.css';

@observer
class App extends Component {

	@observable store = {}

	routes = {
		Main: () => (<Main store={this.store}></Main>),
		NotFound: () => (<NotFound></NotFound>)
	}

	render() {
		return (
		<Router className="App">
			<Switch>
				<Route exact path="/" component={this.routes.Main} />
				{/* Anything that is not said above is not existent thus -> Not Found error 
				This isn't supposed to happen in desktop apps */}
				<Route component={this.routes.NotFound} />
			</Switch>
		</Router>
		);
	}
}

export default App;

import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Register from '../Pages/Register.jsx';
import Logout from '../Pages/Logout.jsx';
import Login from '../Pages/Login.jsx';

class MainNotAuthenticated extends Component {
	render() {
		return (
			<Switch>
				<Route exact path='/register' component={ Register }/>
				<Route exact path='/logout' component={ Logout }/>
				<Route path='/' component={ Login }/>
			</Switch>
		)
	}
}

export default withRouter(MainNotAuthenticated);
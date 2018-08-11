import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Home from '../Pages/Home.jsx';
import Wardrobe from './Wardrobe.jsx';
import Logout from '../Pages/Logout.jsx';
import NotFound from '../Pages/404.jsx';

class MainAuthenticated extends Component {
	render() {
		return (
			<Switch>
				<Route exact path='/' component={ Home }/>
				<Route path='/wardrobe' component={ Wardrobe }/>
				<Route exact path='/logout' component={ Logout }/>
				<Route component={ NotFound }/>
			</Switch>
		)
	}
}

export default withRouter(MainAuthenticated);
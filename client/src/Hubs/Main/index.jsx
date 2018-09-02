import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Landing from '../../Pages/Landing';
import Home from '../../Pages/Home';
import Wardrobe from '../Wardrobe';
import Logout from '../../Pages/Logout';
import NotFound from '../../Pages/404';

class Main extends Component {
	render() {
		const { isAuthenticated } = this.props;
		
		if (isAuthenticated) {
			return (
				<Switch>
					<Route exact path='/' component={ Home }/>
					<Route path='/wardrobe' component={ Wardrobe }/>
					<Route exact path='/logout' component={ Logout }/>
					<Route component={ NotFound }/>
				</Switch>
			)
		} else {
			return (
				<Switch>
					<Route exact path='/logout' component={ Logout }/>
					<Route path='/' component={ Landing }/>
				</Switch>
			)
		}
	}
}

export default withRouter(Main);
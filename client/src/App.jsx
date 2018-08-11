import React, { Component } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import callAPI from './Modules/call-api';
import updateUser from './Modules/update-user';
import Header from './Components/Header.jsx';
import Wardrobe from './Hubs/Wardrobe.jsx';
import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Logout from './Pages/Logout.jsx';
import NotFound from './Pages/404.jsx';
import { connect } from 'react-redux';
import { logUserIn, logUserOut } from './redux-actions';
import userStorage from './Modules/user-storage';
import './App.css';

class App extends Component {
	componentWillMount() {
		const user = JSON.parse(localStorage.getItem('user'));
		const lastRefresh = Number(localStorage.getItem('lastRefresh'));

		if (user && Date.now() - lastRefresh < 1000 * 60 * 60 * 24 * 14) {// must log back in after 2 weeks of inactivity
			userStorage.logUserIn(user, user.token)
		} else if (user) {
			userStorage.clearUserInfo();
		}
	}

	render() {
		const { user, isAuthenticated } = this.props;

		let links, content;
		if (isAuthenticated) {
			links = [
				{name: 'Home', exact: true, href: '/'},
				{name: 'Wardrobe', exact: false, href: '/wardrobe'},
				{name: 'Logout', exact: true, href: '/logout'}
			]

			content = (
				<Switch>
					<Route exact path='/' render={ props => <Home { ...props } updateUser={ this.updateUser }/> }/>
					<Route path='/wardrobe' render={ props => <Wardrobe { ...props }/> }/>
					<Route exact path='/logout' render={ props => <Logout { ...props} logUserOut={ this.logUserOut }/> }/>
					<Route component={ NotFound }/>
				</Switch>
			)
		} else {
			links = [
				{name: 'Login', exact: true, href: '/'},
				{name: 'Register', exact: true, href: '/register'}
			]

			content = (
				<Switch>
					<Route exact path='/register' render={ props => <Register { ...props } logUserIn={ this.logUserIn }/> }/>
					<Route exact path='/logout' render={ props => <Logout { ...props} logUserOut={ this.logUserOut }/> }/>
					<Route path='/' render={ props => <Login { ...props } logUserIn={ this.logUserIn }/> }/>
				</Switch>
			)
		}

		return (
			<div className="App">
				<Header links={ links }/>

				{ content }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user,
		isAuthenticated: state.isAuthenticated
	}
}

export default withRouter(connect(mapStateToProps)(App));
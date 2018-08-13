import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import HeaderNav from './Components/HeaderNav';
import Main from './Hubs/Main';
import { connect } from 'react-redux';
import userStorage from './Modules/user-storage';
import './App.css';
import './Header.css';

class App extends Component {
	constructor() {
		super();
		this.state = {
			hideDrawer: true
		}
	}

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
		const { isAuthenticated } = this.props;
		const { hideDrawer } = this.state;

		return (
			<div className="App">
				<header>
					<NavLink to='/' className='title'>Dr obe</NavLink>
					<HeaderNav isAuthenticated={ isAuthenticated } hideDrawer={ hideDrawer } handleDrawerClick={ () => this.setState({hideDrawer: true}) }/>
					<button className='button-toggle-nav-drawer' onClick={ () => this.setState({hideDrawer: !hideDrawer}) }>+</button>
				</header>

				<Main isAuthenticated={ isAuthenticated }/>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		isAuthenticated: state.isAuthenticated
	}
}

export default withRouter(connect(mapStateToProps)(App));
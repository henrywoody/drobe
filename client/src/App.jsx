import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import HeaderNavAuthenticated from './Components/HeaderNavAuthenticated.jsx';
import HeaderNavNotAuthenticated from './Components/HeaderNavNotAuthenticated.jsx';
import MainAuthenticated from './Hubs/MainAuthenticated.jsx';
import MainNotAuthenticated from './Hubs/MainNotAuthenticated.jsx';
import { connect } from 'react-redux';
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
		const { isAuthenticated } = this.props;

		return (
			<div className="App">
				<header>
					<span id='title'>Drobe</span>
					{ isAuthenticated ? <HeaderNavAuthenticated/> : <HeaderNavNotAuthenticated/>}
				</header>

				{ isAuthenticated ? <MainAuthenticated/> : <MainNotAuthenticated/>}
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
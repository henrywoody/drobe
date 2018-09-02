import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Header from './Components/Header';
import Main from './Hubs/Main';
import { connect } from 'react-redux';
import userStorage from './Modules/user-storage';
import './App.css';

class App extends Component {
	componentDidMount() {
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
				{ isAuthenticated &&
					<Header/>
				}

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
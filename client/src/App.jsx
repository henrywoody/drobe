import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Loader from './Components/Loader';
import Header from './Components/Header';
import Main from './Hubs/Main';
import { connect } from 'react-redux';
import userStorage from './Modules/user-storage';
import './App.css';

class App extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true
		}
	}

	componentDidMount() {
		this.checkAuth();
	}

	checkAuth() {
		this.setState({isLoading: true});

		const user = JSON.parse(localStorage.getItem('user'));
		const lastRefresh = Number(localStorage.getItem('lastRefresh'));

		if (user && Date.now() - lastRefresh < 1000 * 60 * 60 * 24 * 30 * 6) {// must log back in after 6 months of inactivity
			userStorage.logUserIn(user, user.token)
		} else if (user) {
			userStorage.clearUserInfo();
		}
		this.setState({isLoading: false});
	}

	render() {
		const { isAuthenticated } = this.props;
		const { isLoading } = this.state;

		if (isLoading) {
			return (
				<div className='App'>
					<Loader/>
				</div>
			)
		}

		return (
			<div className='App'>
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
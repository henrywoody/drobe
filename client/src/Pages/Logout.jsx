import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import userStorage from '../Modules/user-storage';

class Logout extends Component {
	componentWillMount() {
		fetch('/users/logout');
		userStorage.logUserOut();
	}

	render() {
		return (
			<main>
				<h1>Logged Out</h1>

				<p>
					You have successfully logged out.
				</p>

				<p>
					<NavLink exact to='/'>Click to log back in</NavLink>
				</p>
			</main>
		)
	}
}

export default withRouter(Logout);
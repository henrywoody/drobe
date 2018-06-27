import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

export default class Logout extends Component {
	componentWillMount() {
		const { logUserOut } = this.props;
		fetch('/users/logout');
		logUserOut();
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
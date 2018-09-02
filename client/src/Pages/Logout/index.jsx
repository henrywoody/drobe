import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import userStorage from '../../Modules/user-storage';
import './style.css';

export default class Logout extends Component {
	componentDidMount() {
		fetch('/users/logout');
		userStorage.logUserOut();
	}

	render() {
		return (
			<main className='logged-out-page'>
				<h1>Logged Out</h1>

				<p>
					You have successfully logged out.
				</p>

				<p>
					<NavLink exact to='/'>Click to go to the home page</NavLink>
				</p>
			</main>
		)
	}
}
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import UserForm from '../Forms/UserForm.jsx';

export default class Login extends Component {
	render() {
		const { logUserIn } = this.props;
		
		return (
			<main>
				<h1>Login</h1>

				<UserForm formType='login' logUserIn={ logUserIn }/>
				
				<p>
					Don't have an account? <NavLink exact to='/register'>Register here</NavLink>
				</p>
			</main>
		)
	}
}
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import UserForm from '../Forms/UserForm.jsx';

export default class Login extends Component {
	render() {
		return (
			<main>
				<h1>Login</h1>

				<UserForm formType='login'/>
				
				<p>
					Don't have an account? <Link exact to='/register'>Register here</Link>
				</p>
			</main>
		)
	}
}
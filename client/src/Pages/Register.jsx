import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import UserForm from '../Forms/UserForm.jsx';

export default class Register extends Component {
	render() {
		return (
			<main>
				<h1>Register</h1>

				<UserForm formType='register'/>

				<p>
					Have an account? <NavLink exact to='/'>Login here</NavLink>
				</p>
			</main>
		)
	}
}
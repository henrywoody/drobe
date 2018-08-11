import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import UserForm from '../Forms/UserForm.jsx';

class Register extends Component {
	render() {
		const { logUserIn, history } = this.props;

		return (
			<main>
				<h1>Register</h1>

				<UserForm formType='register' logUserIn={ logUserIn } history={ history }/>

				<p>
					Have an account? <NavLink exact to='/'>Login here</NavLink>
				</p>
			</main>
		)
	}
}

export default withRouter(Register);
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import UserForm from '../Forms/UserForm.jsx';

class Login extends Component {
	render() {
		const { logUserIn } = this.props;
		
		return (
			<main>
				<h1>Login</h1>

				<UserForm formType='login' logUserIn={ logUserIn }/>
				
				<p>
					Don't have an account? <Link exact to='/register'>Register here</Link>
				</p>
			</main>
		)
	}
}

export default withRouter(Login);
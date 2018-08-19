import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import UserForm from '../../Forms/UserForm';
import Runner from '../../Components/Runner';
import './Landing.css';

class Landing extends Component {
	constructor() {
		super();
		this.state = {
			displayedForm: null
		}
	}

	getFormComponent() {
		const { displayedForm } = this.state;

		switch (displayedForm) {
		case 'register':
			return (
				<div className='form-box'>
					<h3>Register</h3>

					<UserForm formType='register' handleCancel={ () => this.setState({ displayedForm: null }) }/>	
				</div>
			)
		case 'login':
		return (
				<div className='form-box'>
					<h3>Login</h3>

					<UserForm formType='login' handleCancel={ () => this.setState({ displayedForm: null }) }/>	
				</div>
			)
		default:
			return (
				<div className='form-box'>
					<h3>Get Started</h3>

					<div className='buttons-container'>
						<button className='btn-primary' onClick={ () => this.setState({ displayedForm: 'register' }) }>Create an Account</button>
						<button className='btn-secondary' onClick={ () => this.setState({ displayedForm: 'login' }) }>Login</button>
					</div>
				</div>
			)
		}
	}

	render() {
		const formComponent = this.getFormComponent();

		return (
			<main className='landing'>
				<section>
					<div>
						<h1 className='title big-title'>Dr obe</h1>

						<div className='runner-container'>
							<Runner width={ window.innerWidth / 3 } height={ 2 } runSpeed={ 2 } inverted/>
						</div>

						<h2 className='tagline'>
							Wake up to the future.
						</h2>

						<p>
							Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
						</p>
					</div>
				</section>

				<section>
					{ formComponent }
				</section>
			</main>
		)
	}
}

export default withRouter(Landing);
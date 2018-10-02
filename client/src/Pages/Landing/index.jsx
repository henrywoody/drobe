import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import UserForm from '../../Forms/UserForm';
import Runner from '../../Components/Runner';
import SocialAuthButtons from '../../Components/SocialAuthButtons';
import './style.css';

class Landing extends Component {
	constructor() {
		super();
		this.state = {
			displayedForm: null,
			runnerWidth: window.innerWidth / 3
		}
	}

	componentDidMount() {
		window.addEventListener('resize', this.updateRunnerWidth);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateRunnerWidth);
	}

	updateRunnerWidth = () => {
		this.setState({runnerWidth: window.innerWidth / 3});
	}

	getFormComponent() {
		const { displayedForm } = this.state;

		const socialAuthButtons = (
			<div className='social-auth-div'>
				<span>or</span>
				<SocialAuthButtons/>
			</div>
		)

		switch (displayedForm) {
		case 'register':
			return (
				<div className='form-box'>
					<h3>Register</h3>

					<UserForm formType='register' handleCancel={ () => this.setState({ displayedForm: null }) }/>	

					{ socialAuthButtons }
				</div>
			)
		case 'login':
		return (
				<div className='form-box'>
					<h3>Login</h3>

					<UserForm formType='login' handleCancel={ () => this.setState({ displayedForm: null }) }/>	

					{ socialAuthButtons }
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

					{ socialAuthButtons }
				</div>
			)
		}
	}

	render() {
		const { runnerWidth } = this.state;
		
		const formComponent = this.getFormComponent();

		return (
			<main className='landing'>
				<section>
					<div>
						<h1 className='title big-title'>Dr obe</h1>

						<div className='runner-container'>
							<Runner width={ runnerWidth } height={ 2 } runSpeed={ 2 } inverted/>
						</div>

						<h2 className='tagline'>
							Wake up to the future.
						</h2>

						<p>
							Conserve your energy for the decisions that matter by delegating your wardrobe decisions to Drobe.
							Drobe considers the weather, your outfit history, and your preferences to create specially curated outfits for you each morning.
							Style and productivity have never been so compatible.
						</p>

						<p>
							The future is now. The future is Drobe.
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
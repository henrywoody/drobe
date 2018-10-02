import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import userStorage from '../../Modules/user-storage';

class UserForm extends Component {
	constructor() {
		super();
		this.state = {
			formData: {
				email: '',
				password: '',
				passwordCheck: '',
				location: {}
			},
			message: ''
		}
	}

	handleChange = event => {
		const { name, value } = event.target;
		const { formData } = this.state;

		formData[name] = value;

		this.setState({ formData });
	}

	handleSubmit = async event => {
		event.preventDefault();
		const { formType, history } = this.props;
		const { formData } = this.state;

		if (formType === 'register') {
			if (!formData.email) {
				return this.setState({message: 'Email cannot be blank.'});
			}
			if (formData.password !== formData.passwordCheck) {
				return this.setState({message: 'Passwords do not match.'});
			}
			if (formData.email.includes(' ')) {
				return this.setState({message: 'Email cannot contain spaces.'});
			}
		}

		const response = await fetch(`/users/${formType}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({user: formData})
		})

		if (response.status !== 200) {
			if (formType === 'login') {
				this.setState({message: 'Invalid email or password.'});
			} else {
				const jsonResponse = await response.json()
				if (jsonResponse.error === 'UserExistsError') {
					this.setState({message: 'That email is already taken.'});
				} else if (jsonResponse.error === 'InvalidEmailError') {
					this.setState({message: 'Please provide a valid email address.'});
				} else {
					this.setState({message: 'Something went wrong :/'});
				}
			}
		} else {
			const jsonResponse = await response.json();
			userStorage.logUserIn(jsonResponse.user, jsonResponse.token);
			
			history.replace('/');
		}
	}

	render() {
		const { formType, handleCancel } = this.props;
		const { formData, message } = this.state;

		return (
			<form onSubmit={ this.handleSubmit }>
				<div className='form-message-container'>
					<span className='form-message'>{ message }</span>
				</div>
				
				<div className='input-container'>
					<label htmlFor='email'>Email</label>
					<input name='email' type='text' placeholder='email' value={ formData.email || '' } onChange={ this.handleChange }/>
				</div>

				<div className='input-container'>
					<label htmlFor='password'>Password</label>
					<input name='password' type='password' placeholder='password' value={ formData.password || '' } onChange={ this.handleChange }/>
				</div>

				{ formType === 'register' &&
					<div className='input-container'>
						<label htmlFor='passwordCheck'>Confirm Password</label>
						<input name='passwordCheck' type='password' placeholder='password' value={ formData.passwordCheck || '' } onChange={ this.handleChange }/>
					</div>
				}

				<div className='buttons-container'>
					{ formType === 'login' && 
						<button className='btn-primary' onClick={ this.handleSubmit }>Login</button>
					}

					{ formType === 'register' && 
						<button className='btn-primary' onClick={ this.handleSubmit }>Register</button>
					}

					{ handleCancel && 
						<button className='btn-secondary' onClick={ e => { e.preventDefault(); handleCancel() } }>Cancel</button>
					}
				</div>
			</form>
		)
	}
}

export default withRouter(UserForm);
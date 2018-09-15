import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import userStorage from '../../Modules/user-storage';

class UserForm extends Component {
	constructor() {
		super();
		this.state = {
			formData: {
				username: '',
				password: '',
				passwordCheck: '',
				location: {}
			},
			message: ''
		}
	}

	handleChange = (event) => {
		const { name, value } = event.target;
		const { formData } = this.state;

		formData[name] = value;

		this.setState({ formData });
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const { formType, history } = this.props;
		const { formData } = this.state;

		if (formType === 'register') {
			if (formData.password !== formData.passwordCheck) {
				return this.setState({message: 'Passwords do not match.'});
			}
			if (formData.username.includes(' ')) {
				return this.setState({message: 'Username cannot contain spaces.'})
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
				this.setState({message: 'Invalid username or password.'});
			} else {
				const jsonResponse = await response.json()
				if (jsonResponse.error === 'UserExistsError') {
					this.setState({message: 'That username is already taken.'})
				} else {
					this.setState({message: 'Something went wrong :/'})
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
					<label htmlFor='username'>Username</label>
					<input name='username' type='text' placeholder='username' value={ formData.username || '' } onChange={ this.handleChange }/>
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
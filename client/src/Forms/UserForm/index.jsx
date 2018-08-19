import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import userStorage from '../../Modules/user-storage';

class UserForm extends Component {
	constructor() {
		super();
		this.state = {
			formOptions: {
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
		const { formOptions } = this.state;

		formOptions[name] = value;

		this.setState({ formOptions });
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const { formType, history } = this.props;
		const { formOptions } = this.state;

		if (formType === 'register') {
			if (formOptions.password !== formOptions.passwordCheck)
				return this.setState({message: 'Passwords do not match.'});
		}

		const response = await fetch(`/users/${formType}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({user: formOptions})
		})

		if (response.status !== 200) {
			if (formType === 'login') {
				this.setState({message: 'Invalid username or password.'});
			} else {
				this.setState({message: 'Somethings wrong'})
			}
		} else {
			const jsonResponse = await response.json();
			userStorage.logUserIn(jsonResponse.user, jsonResponse.token);
			
			history.replace('/');
		}
	}

	render() {
		const { formType, handleCancel } = this.props;
		const { formOptions, message } = this.state;

		return (
			<form onSubmit={ this.handleSubmit }>
				<div className='form-message-container'>
					<span className='form-message'>{ message }</span>
				</div>
				
				<div className='input-container'>
					<label htmlFor='username'>Username</label>
					<input name='username' type='text' placeholder='username' value={ formOptions.username } onChange={ this.handleChange }/>
				</div>

				<div className='input-container'>
					<label htmlFor='password'>Password</label>
					<input name='password' type='password' placeholder='password' value={ formOptions.password } onChange={ this.handleChange }/>
				</div>

				{ formType === 'register' &&
					<div className='input-container'>
						<label htmlFor='passwordCheck'>Confirm Password</label>
						<input name='passwordCheck' type='password' placeholder='password' value={ formOptions.passwordCheck } onChange={ this.handleChange }/>
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
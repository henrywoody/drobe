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
				this.setState({message: 'Passwords do not match.'});
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
			
			if (formType === 'register')
				history.replace('/');
		}
	}

	render() {
		const { formType } = this.props;
		const { formOptions, message } = this.state;

		const formInputs = [];
		formInputs.push(
			<div key='username'>
				<label htmlFor='username'>Username</label>
				<input name='username' type='text' placeholder='username' value={ formOptions.username } onChange={ this.handleChange }/>
			</div>
		);
		formInputs.push(
			<div key='password'>
				<label htmlFor='password'>Password</label>
				<input name='password' type='password' placeholder='password' value={ formOptions.password } onChange={ this.handleChange }/>
			</div>
		);

		if (formType === 'login') {
			formInputs.push(
				<input key='login' type='submit' value='Login'/>
			)
		}

		if (formType === 'register') {
			formInputs.push(
				<div key='passwordCheck'>
					<label htmlFor='passwordCheck'>Confirm Password</label>
					<input name='passwordCheck' type='password' placeholder='password' value={ formOptions.passwordCheck } onChange={ this.handleChange }/>
				</div>
			);

			formInputs.push(
				<input key='register' type='submit' value='Register'/>
			);
		}

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }
				{ formInputs }
			</form>
		)
	}
}

export default withRouter(UserForm);
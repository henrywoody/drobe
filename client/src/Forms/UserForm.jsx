import React, { Component } from 'react';
import callAPI from '../Modules/call-api';

export default class UserForm extends Component {
	constructor() {
		super();
		this.state = {
			formOptions: {
				username: '',
				password: '',
				passwordCheck: '',
				location: {
					name: '',
					latitude: '',
					longitude: ''
				}
			},
			message: ''
		}
	}

	handleChange = (event) => {
		const { name, value } = event.target;
		const { formOptions } = this.state;

		const matched = name.match(/(\w*?)-(\w*)/);
		if (matched) {
			const [_, name1, name2] = matched;
			formOptions[name1][name2] = value;
		} else {
			formOptions[name] = value;
		}
		this.setState({ formOptions });
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const { formType, logUserIn, history } = this.props;

		if (formType === 'register') {
			if (this.state.formOptions.password !== this.state.formOptions.passwordCheck)
				this.setState({message: 'Passwords do not match.'});

			const coordinateCheck = await this.findCoordinates();
			if (!coordinateCheck)
				return;
		}

		const { formOptions } = this.state;

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
			logUserIn(jsonResponse.user, jsonResponse.token);
			
			if (formType === 'register')
				history.replace('/');
		}
	}

	findCoordinates = async (event) => {
		if (event) event.preventDefault();

		const { formOptions, message } = this.state;
		const locationMessage = 'Location not recognized.'

		const locationData = await callAPI('data/coordinates', {address: formOptions.location.name});
		if (locationData.error) {
			this.setState({message: locationMessage});
		} else {
			const { location: name, latitude, longitude } = locationData;
			const updatedState = {
				formOptions: {...formOptions, location: { name, latitude, longitude }}
			}
			if (message === locationMessage)
				updatedState.message = '';

			await this.setState(updatedState);
			return true
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
				<div key='location-name'>
					<label htmlFor='location-name'>Location</label>
					<input name='location-name' type='text' placeholder='location' value={ formOptions.location.name } onChange={ this.handleChange }/>
					<button onClick={ this.findCoordinates }>Validate</button>
				</div>
			)

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
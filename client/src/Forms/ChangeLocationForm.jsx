import React, { Component } from 'react';
import callAPI from '../Modules/call-api';

export default class ChangeLocationForm extends Component {
	constructor() {
		super();
		this.state = {
			location: {
				name: '',
				latitude: '',
				longitude: ''
			},
			message: ''
		};
	}

	componentWillMount() {
		const { user } = this.props;
		if (user.location && Object.keys(user.location).length)
			this.setState({ location: user.location });
	}

	handleChange = (event) => {
		const { location } = this.state;

		this.setState({
			location: {
				...location,
				name: event.target.value
			}
		})
	}

	handleSubmit = async (event) => {
		event.preventDefault();

		const coordinateCheck = await this.findCoordinates();
		if (!coordinateCheck)
			return;

		const { didSubmit, updateUser, user } = this.props;
		const { location } = this.state;
		updateUser({...user, location});
		didSubmit();
	}

	findCoordinates = async (event) => {
		if (event) event.preventDefault();

		const { location, message } = this.state;
		const locationMessage = 'Location not recognized.'

		const locationData = await callAPI('data/coordinates', {address: location.name});
		if (locationData.error) {
			this.setState({message: locationMessage});
		} else {
			const { location: name, latitude, longitude } = locationData;
			const updatedState = {
				location: { name, latitude, longitude }
			}
			if (message === locationMessage)
				updatedState.message = '';

			await this.setState(updatedState);
			return true
		}
	}

	render() {
		const { location, message } = this.state;

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }
				<label htmlFor='location-name'>Location</label>
				<input name='location-name' type='text' placeholder='location' value={ location.name } onChange={ this.handleChange }/>
				<button onClick={ this.findCoordinates }>Validate</button>
				<input type='submit'/>
			</form>
		)
	}
}
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import callAPI from '../Modules/call-api';
import userStorage from '../Modules/user-storage';

class ChangeLocationForm extends Component {
	constructor() {
		super();
		this.state = {
			locationName: '',
			longitude: '',
			latitude: '',
			message: ''
		};
	}

	componentWillMount() {
		const { user } = this.props;
		const { locationName, longitude, latitude } = user;
		this.setState({ locationName, longitude, latitude });
	}

	handleChange = (event) => {
		this.setState({ locationName: event.target.value });
	}

	handleSubmit = async (event) => {
		event.preventDefault();

		const coordinateCheck = await this.findCoordinates();
		if (!coordinateCheck)
			return;

		const { didSubmit, user } = this.props;
		const { locationName, longitude, latitude } = this.state;
		userStorage.updateUser({...user, locationName, longitude, latitude});
		didSubmit();
	}

	findCoordinates = async (event) => {
		if (event) event.preventDefault();

		const { locationName, message } = this.state;
		const locationNotRecognized = 'Location not recognized.'

		const locationData = await callAPI('data/coordinates', {address: locationName});
		if (locationData.error) {
			this.setState({message: locationNotRecognized});
		} else {
			const { location: newLocationName, longitude, latitude } = locationData;
			const updatedState = {
				locationName: newLocationName,
				longitude,
				latitude
			}
			if (message === locationNotRecognized)
				updatedState.message = '';

			await this.setState(updatedState);
			return true
		}
	}

	render() {
		const { locationName, message } = this.state;

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }
				<label htmlFor='location-name'>Location</label>
				<input name='location-name' type='text' placeholder='location' value={ locationName } onChange={ this.handleChange }/>
				<button onClick={ this.findCoordinates }>Validate</button>
				<input type='submit'/>
			</form>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(ChangeLocationForm));
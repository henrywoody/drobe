import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import api from '../../Modules/api';
import userStorage from '../../Modules/user-storage';
import '../Forms.css';

class ChangeLocationForm extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
			locationName: '',
			longitude: '',
			latitude: '',
			message: ''
		};
	}

	componentDidMount() {
		const { user } = this.props;
		const { locationName, longitude, latitude } = user;
		this.setState({ locationName: locationName || '', longitude, latitude });
	}

	handleChange = event => {
		this.setState({locationName: event.target.value});
	}

	handleSubmit = async event => {
		event.preventDefault();

		const { didSubmit, user } = this.props;

		if (this.state.locationName === user.locationName) {
			return didSubmit(false);
		}

		const coordinateCheck = await this.findCoordinates();
		if (!coordinateCheck) {
			return;
		}

		const { locationName, longitude, latitude } = this.state; // need to be declared *after* coordinateCheck
		userStorage.updateUser({...user, locationName, longitude, latitude});
		didSubmit(user.locationName !== locationName);
	}

	findCoordinates = async event => {
		if (event) event.preventDefault();
		this.setState({isLoading: true});

		const { locationName, message } = this.state;
		const locationNotRecognized = 'Location not recognized.'

		const locationData = await api.getLocationData(locationName);
		if (locationData.error) {
			this.setState({message: locationNotRecognized, isLoading: false});
		} else {
			const { location: newLocationName, longitude, latitude } = locationData;

			await this.setState({
				locationName: newLocationName,
				longitude,
				latitude,
				message: message === locationNotRecognized ? '' : message,
				isLoading: false
			});
			return true;
		}
	}

	render() {
		const { handleCancel } = this.props;
		const { locationName, message, isLoading } = this.state;

		if (isLoading) {
			return <Loader/>
		}

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }
				<div className='input-container'>
					<label htmlFor='location-name'>Location</label>
					<input name='location-name' type='text' placeholder='Seattle, WA, USA' value={ locationName || '' } onChange={ this.handleChange }/>
				</div>

				<div className='buttons-container'>
					<button className='btn-primary' onClick={ this.handleSubmit }>Update</button>
					<button className='btn-secondary' onClick={ handleCancel }>Cancel</button>
				</div>
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
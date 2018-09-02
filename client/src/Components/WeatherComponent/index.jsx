import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../Loader';
import ChangeLocationForm from '../../Forms/ChangeLocationForm';
import api from '../../Modules/api';
import './style.css';

class WeatherComponent extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true,
			weather: {},
			showLocationForm: false
		}
	}

	componentDidMount() {
		this.refreshWeather();
	}

	componentDidUpdate(prevProps) {
		const { user } = this.props;
		if (!(user.longitude && user.latitude)) return;
		const userReceivedCoordinates = (user.longitude && user.latitude) && !(prevProps.user.longitude && prevProps.user.latitude);
		const userChangedCoordinates = user.longitude !== prevProps.user.longitude || user.latitude !== prevProps.user.latitude;
		if (userReceivedCoordinates || userChangedCoordinates) {
			this.refreshWeather();
		}
	}

	async refreshWeather() {
		this.setState({isLoading: true});
		const { user } = this.props;

		if (!(user.longitude && user.latitude)) return;

		const coordinates = {
			latitude: user.latitude,
			longitude: user.longitude
		}

		const weather = await api.getWeather(coordinates, user.token);
		this.setState({ isLoading: false, weather });
	}

	didSubmitLocation = (wasChanged) => {
		if (wasChanged) {
			this.setState({showLocationForm: false, isLoading: true});
		} else {
			this.setState({showLocationForm: false});
		}
	}

	render() {
		const { user } = this.props;
		const { isLoading, weather, showLocationForm } = this.state;

		let content;
		if (isLoading && user.longitude && user.latitude) {
			content = (
				<div className='content'>
					<Loader/>
				</div>
			)
		} else if (user.longitude && user.latitude && !showLocationForm) {
			content = (
				<div className='content'>
					<div className='location'>
						<span>In { user.locationName }</span>

						<div className='buttons-container'>
							<button className='btn-secondary' onClick={ () => this.setState({showLocationForm: true}) }>Change Location</button>
						</div>
					</div>

					<div className='weather-data'>
						<div className='summary'><span>{ weather.summary }</span></div>
						<div className='temperature'>
							<span className='main-temperature'>{ Math.round(weather.aveTemp) }˚F</span>
							<div className='side-temperature'>
								<span>Ave. Temperature</span>
								<span>High { Math.ceil(weather.maxTemp) }˚F</span>
								<span>Low { Math.ceil(weather.minTemp) }˚F</span>
							</div>
						</div>
						<div className='rain'>
							<span><span style={ {fontSize: `${1 + weather.rainProb * 2}rem`} }>{ Math.round(weather.rainProb * 100) }%</span> Chance of Rain</span>
							<span>Rainfall { weather.rainRate * 1000 } mm/hr</span>
						</div>

						<div className='powered-by'><span>Powered by <a href='https://darksky.net/poweredby/'>Dark Sky</a></span></div>
					</div>
				</div>
			)
		} else if (!showLocationForm) {
			content = (
				<div className='content'>
					<div className='location'>
						<span>
							You haven't set a location yet.
							Location information is used to get weather data, which is used in picking outfits.
						</span>
						<div className='buttons-container'>
							<button className='btn-primary' onClick={ () => this.setState({showLocationForm: true}) }>Add Location</button>
						</div>
					</div>
				</div>
			)
		} else {
			content = (
				<div className='content'>
					<ChangeLocationForm didSubmit={ this.didSubmitLocation }/>
					<div className='buttons-container'>
						<button className='btn-secondary' onClick={ () => this.setState({showLocationForm: false}) }>Cancel</button>
					</div>
				</div>
			)
		}

		return (
			<div className='component'>
				<h2>Weather</h2>

				{ content }
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(WeatherComponent));
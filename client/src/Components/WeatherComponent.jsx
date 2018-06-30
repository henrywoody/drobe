import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import PieceOfWeatherData from './PieceOfWeatherData.jsx';
import ChangeLocationForm from '../Forms/ChangeLocationForm.jsx';

export default class WeatherComponent extends Component {
	constructor() {
		super();
		this.state = {
			weather: {},
			showLocationForm: false
		}
	}

	componentWillMount() {
		this.refreshWeather();
	}

	componentDidUpdate(prevProps) {
		const { user } = this.props;
		if (!user.location) return;
		if (user.location && !prevProps.user.location || user.location.latitude !== prevProps.user.location.latitude || user.location.longitude !== prevProps.user.location.longitude)
			this.refreshWeather();
	}

	async refreshWeather() {
		const { user } = this.props;

		if (!user.location) return;

		const location = {
			latitude: user.location.latitude,
			longitude: user.location.longitude
		}

		const weather = await callAPI('data/weather', location, user.token);
		this.setState({ weather });
	}

	toggleLocationForm = () => {
		const { showLocationForm } = this.state;
		this.setState({ showLocationForm: !showLocationForm });
	}

	render() {
		const { updateUser, user } = this.props;
		const { weather, showLocationForm } = this.state;

		let content;
		if (user.location && !showLocationForm) {
			const location = user.location.name;
			const weatherBlocks = [];
			for (const weatherKey in weather) {
				weatherBlocks.push(<PieceOfWeatherData key={ weatherKey } name={ weatherKey } value={ weather[weatherKey] }/>)
			}

			content = (
				<div>
					<p>In { location }</p>
					<button onClick={ this.toggleLocationForm }>Change Location</button>
					{ weatherBlocks }
				</div>
			)
		} else if (!showLocationForm) {
			content = (
				<div>
					<p>
						You haven't set a location yet.
						Location information is used to get weather data, which is used in picking outfits.
					</p>
					<button onClick={ this.toggleLocationForm }>Add Location</button>
				</div>
			)
		} else {
			content = (
				<div>
					<ChangeLocationForm didSubmit={ this.toggleLocationForm } updateUser={ updateUser } user={ user } />
					<button onClick={ this.toggleLocationForm }>Cancel</button>
				</div>
			)
		}

		return (
			<div>
				<h2>Weather</h2>

				{ content }
			</div>
		)
	}
}
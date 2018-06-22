import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import PieceOfWeatherData from './PieceOfWeatherData.jsx';

export default class WeatherComponent extends Component {
	constructor() {
		super();
		this.state = {
			weather: {}
		}
	}

	async componentWillMount() {
		const { user } = this.props;

		const location = {
			latitude: user.location.latitude,
			longitude: user.location.longitude
		}

		const weather = await callAPI('data/weather', location, user.token);
		this.setState({ weather });
	}

	render() {
		const { user } = this.props;
		const { weather } = this.state;

		const location = user.location.name;

		const weatherBlocks = [];
		for (const weatherKey in weather) {
			weatherBlocks.push(<PieceOfWeatherData key={ weatherKey } name={ weatherKey } value={ weather[weatherKey] }/>)
		}

		return (
			<div>
				<h2>Weather</h2>

				<p>In { location }</p>

				{ weatherBlocks }
			</div>
		)
	}
}
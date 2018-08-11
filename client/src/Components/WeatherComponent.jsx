import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import callAPI from '../Modules/call-api';
import PieceOfWeatherData from './PieceOfWeatherData.jsx';
import ChangeLocationForm from '../Forms/ChangeLocationForm.jsx';

class WeatherComponent extends Component {
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
		if (!(user.longitude && user.latitude)) return;
		if ((user.longitude && user.latitude) && !(prevProps.user.longitude && prevProps.user.latitude) || user.longitude !== prevProps.user.longitude || user.latitude !== prevProps.user.latitude)
			this.refreshWeather();
	}

	async refreshWeather() {
		const { user } = this.props;

		if (!(user.longitude && user.latitude)) return;

		const location = {
			latitude: user.latitude,
			longitude: user.longitude
		}

		const weather = await callAPI('data/weather', location, user.token);
		this.setState({ weather });
	}

	toggleLocationForm = () => {
		const { showLocationForm } = this.state;
		this.setState({ showLocationForm: !showLocationForm });
	}

	render() {
		const { user } = this.props;
		const { weather, showLocationForm } = this.state;

		let content;
		if (user.longitude && user.latitude && !showLocationForm) {
			const weatherBlocks = [];
			for (const weatherKey in weather) {
				weatherBlocks.push(<PieceOfWeatherData key={ weatherKey } name={ weatherKey } value={ weather[weatherKey] }/>)
			}

			content = (
				<div>
					<p>In { user.locationName }</p>
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
					<ChangeLocationForm didSubmit={ this.toggleLocationForm }/>
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

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(WeatherComponent));
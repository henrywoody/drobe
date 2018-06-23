import React, { Component } from 'react';
import OutfitGenerator from '../Components/OutfitGenerator.jsx';
import WeatherComponent from '../Components/WeatherComponent.jsx';

export default class Home extends Component {
	render() {
		const { user, history } = this.props;

		return (
			<main>
				<h1>Home</h1>

				<p>
					Welcome home.
				</p>

				<WeatherComponent user={ user } history={ history }/>
				
				<OutfitGenerator user={ user } history={ history }/>
			</main>
		);
	}
}
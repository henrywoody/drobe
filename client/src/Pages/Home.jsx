import React, { Component } from 'react';
import OutfitGenerator from '../Components/OutfitGenerator.jsx';
import WeatherComponent from '../Components/WeatherComponent.jsx';

export default class Home extends Component {
	render() {
		const { user } = this.props;

		return (
			<main>
				<h1>Home</h1>

				<p>
					Welcome home.
				</p>

				<WeatherComponent user={ user }/>
				
				<OutfitGenerator user={ user }/>
			</main>
		);
	}
}
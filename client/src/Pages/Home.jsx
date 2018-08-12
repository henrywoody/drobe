import React, { Component } from 'react';
import OutfitGenerator from '../Components/OutfitGenerator.jsx';
import WeatherComponent from '../Components/WeatherComponent.jsx';

export default class Home extends Component {
	render() {
		return (
			<main>
				<h1>Home</h1>

				<p>
					Welcome home.
				</p>

				<WeatherComponent/>
				
				<OutfitGenerator/>
			</main>
		);
	}
}
import React, { Component } from 'react';
import OutfitGenerator from '../../Components/OutfitGenerator';
import WeatherComponent from '../../Components/WeatherComponent';
import './style.css';

export default class Home extends Component {
	render() {
		return (
			<main>
				<h1>Home</h1>

				<p className='welcome-message'>
					Welcome to Drobe.
				</p>

				<div className='components'>
					<WeatherComponent/>
					
					<OutfitGenerator/>
				</div>
			</main>
		);
	}
}
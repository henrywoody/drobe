import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import OutfitGenerator from '../Components/OutfitGenerator.jsx';
import WeatherComponent from '../Components/WeatherComponent.jsx';

class Home extends Component {

	render() {
		const { userHasClothes, user } = this.props;

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

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(Home));
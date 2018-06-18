import React, { Component } from 'react';
import WardrobeDisplayArea from '../Components/WardrobeDisplayArea';

export default class Wardrobe extends Component {
	render() {
		const { user } = this.props;

		return (
			<main>
				<h1>Wardrobe</h1>

				<WardrobeDisplayArea user={ user }/>
			</main>
		)
	}
}
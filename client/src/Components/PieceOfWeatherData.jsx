import React, { Component } from 'react';

export default class PieceOfWeatherData extends Component {
	render() {
		const { name, value } = this.props;

		return (
			<div>
				<span>{ name }</span>
				<span>{ value }</span>
			</div>
		)
	}
}
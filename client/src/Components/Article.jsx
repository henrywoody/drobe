import React, { Component } from 'react';

export default class Article extends Component {
	render() {
		const { data } = this.props;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		return (
			<div>
				<h3>{ data.name }</h3>

				{ img }

				<p>{ data.description }</p>
			</div>
		);
	}
}
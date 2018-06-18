import React, { Component } from 'react';

export default class DetailedArticle extends Component {
	render() {
		const { data } = this.props;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		const additionalBits = [];
		for (const key in data) {
			if (data[key] && !['_id', 'owner', 'name', 'image', 'description', 'kind', 'shirts', 'pants', 'outerwears'].includes(key))
				additionalBits.push(
					<li key={ key }><strong>{ key }</strong>: { data[key] }</li>
				);
		}

		return (
			<div>
				<h3>{ data.name }</h3>

				{ img }

				<p>{ data.description }</p>

				<ul>
					{ additionalBits }
				</ul>

			</div>
		);
	}
}
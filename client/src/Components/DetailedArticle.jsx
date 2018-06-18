import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import history from '../Modules/history';

export default class DetailedArticle extends Component {
	constructor() {
		super();
		this.state = {
			data: {}
		}
	}

	async componentWillMount() {
		const { match, user } = this.props;
		const { articleKind, articleId } = match.params;
		const data = await callAPI(`${articleKind}/${articleId}`, null, user.token);
		this.setState({ data });
	}

	render() {
		const { data } = this.state;

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
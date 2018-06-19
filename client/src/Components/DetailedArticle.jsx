import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import history from '../Modules/history';
import { NavLink } from 'react-router-dom';

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

	handleDelete = () => {
		const { match, history, user, updateWardrobe } = this.props;
		const { articleKind, articleId } = match.params;
		const { data } = this.state;
		
		callAPI(`${articleKind}/${articleId}`, null, user.token, 'DELETE');
		updateWardrobe.remove(data);
		history.replace('/wardrobe')
	}

	render() {
		const { match } = this.props;
		const { data } = this.state;

		const { articleKind, articleId } = match.params;

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

				<NavLink exact to={ `/wardrobe/${articleKind}/${articleId}/edit` }>Edit</NavLink>
				<button onClick={ this.handleDelete }>Delete</button>

				{ img }

				<p>{ data.description }</p>

				<ul>
					{ additionalBits }
				</ul>

			</div>
		);
	}
}
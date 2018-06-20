import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import history from '../Modules/history';
import { NavLink } from 'react-router-dom';
import SmallArticle from './SmallArticle.jsx';

export default class DetailedArticle extends Component {
	constructor() {
		super();
		this.state = {
			data: {}
		}
	}

	componentWillMount() {
		const { history, match, user } = this.props;
		const { articleKind, articleId } = match.params;

		this.setupData(articleKind, articleId);

		this.unlisten = history.listen((location, action) => {
			if (location.pathname.match(/wardrobe\/\w*?\/\w*?$/)) {
				const [_, kind, id] = location.pathname.match(/wardrobe\/(\w*?)\/(\w*?)$/);
				this.setupData(kind, id);
			}
		})
	}

	componentWillUnmount() {
		this.unlisten();
	}

	async setupData(articleKind, articleId) {
		const { user } = this.props;
		const data = await callAPI(`${articleKind}/${articleId}`, null, user.token);
		this.setState({ data });	
	}

	handleDelete = () => {
		const { match, history, user, updateWardrobe } = this.props;
		const { articleKind, articleId } = match.params;
		const { data } = this.state;
		
		callAPI(`${articleKind}/${articleId}`, null, user.token, 'DELETE');
		updateWardrobe.remove(data);
		history.replace('/wardrobe');
	}

	routeToArticle = async (kind, id) => {
		const { history } = this.props;
		history.replace(`/wardrobe/${kind}/${id}`);
	}

	render() {
		const { match, existingArticles } = this.props;
		const { data } = this.state;

		const { articleKind, articleId } = match.params;

		const img = data.image ? (
			<img src={ data.image }/>
		) : (
			null
		);

		const additionalBits = [];
		for (const key in data) {
			if (data[key] && !['_id', 'owner', 'name', 'image', 'description', 'kind', 'shirts', 'pants', 'outerwears'].includes(key)) {
				additionalBits.push(
					<li key={ key }><strong>{ key }</strong>: { data[key] }</li>
				);
			} else if (['shirts', 'pants', 'outerwears'].includes(key)) {
				additionalBits.push(
					<div>
						{ data[key].map(id => {
							const a = existingArticles.filter(a => a._id === id)[0];
							return <SmallArticle key={ a._id } field={ key } id={ a._id } name={ a.name } image={ a.image } onClick={ this.routeToArticle }/>;
						}) }
					</div>
				);
			}
		}

		return (
			<div>
				<NavLink exact to='/wardrobe'>Back</NavLink>
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
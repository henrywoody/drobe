import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import callAPI from '../Modules/call-api';
import SmallArticle from './SmallArticle.jsx';

class DetailedArticle extends Component {
	constructor() {
		super();
		this.state = {
			data: {}
		}
	}

	componentWillMount() {
		const { match, history } = this.props;
		const { pluralArticleKind, articleId } = match.params;

		this.setupData(pluralArticleKind, articleId);

		this.unlisten = history.listen((location, action) => {
			if (location.pathname.match(/wardrobe\/\w*?\/\w*?$/)) {
				const [_, pluralArticleKind, id] = location.pathname.match(/wardrobe\/(\w*?)\/(\w*?)$/);
				this.setupData(pluralArticleKind, id);
			}
		})
	}

	componentWillUnmount() {
		this.unlisten();
	}

	async setupData(pluralArticleKind, articleId) {
		const { user } = this.props;
		const data = await callAPI(`${pluralArticleKind}/${articleId}`, null, user.token);
		await this.setState({ data });
	}

	handleDelete = () => {
		const { match, history, user, updateWardrobe } = this.props;
		const { pluralArticleKind, articleId } = match.params;
		const { data } = this.state;
		
		callAPI(`${pluralArticleKind}/${articleId}`, null, user.token, 'DELETE');
		updateWardrobe.remove(data);
		history.replace('/wardrobe');
	}

	routeToArticle = async (pluralArticleKind, id) => {
		const { history } = this.props;
		history.replace(`/wardrobe/${pluralArticleKind}/${id}`);
	}

	render() {
		const { match, existingArticles } = this.props;
		const { data } = this.state;

		const { pluralArticleKind, articleId } = match.params;

		const additionalBits = [];
		for (const key in data) {
			console.log(key, data[key])
			if (data[key] && !['id', 'owner', 'name', 'image', 'description', 'articleKind', 'shirts', 'pants', 'outerwears'].includes(key)) {
				additionalBits.push(
					<li key={ key }><strong>{ key }</strong>: { data[key] }</li>
				);
			} else if (['shirts', 'pants', 'outerwears'].includes(key)) {
				additionalBits.push(
					<div key={ key }>
						{ data[key].map(e => {
							return <SmallArticle key={ e.id } field={ key } id={ e.id } name={ e.name } image={ e.image } onClick={ this.routeToArticle }/>;
						}) }
					</div>
				);
			}
		}

		return (
			<div>
				<h3>{ data.name }</h3>

				<NavLink exact to={ `/wardrobe/${pluralArticleKind}/${articleId}/edit` }>Edit</NavLink>
				<button onClick={ this.handleDelete }>Delete</button>

				<img src={ data.image } alt='image'/>

				<p>{ data.description }</p>

				<ul>
					{ additionalBits }
				</ul>

			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(DetailedArticle));
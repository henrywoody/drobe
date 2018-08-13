import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import api from '../../Modules/api';
import SmallArticle from '../../Components/SmallArticle';

class ArticleDetail extends Component {
	constructor() {
		super();
		this.state = {
			articleData: {}
		}
	}

	componentWillMount() {
		const { match, history } = this.props;
		const { pluralArticleKind, articleId } = match.params;

		this.setupData(pluralArticleKind, articleId);

		this.unlisten = history.listen((location, action) => {
			if (location.pathname.match(/wardrobe\/\w*?\/\w*?$/)) {
				const [pluralArticleKind, id] = location.pathname.match(/wardrobe\/(\w*?)\/(\w*?)$/).slice(1);
				this.setupData(pluralArticleKind, id);
			}
		})
	}

	componentWillUnmount() {
		this.unlisten();
	}

	async setupData(pluralArticleKind, articleId) {
		const { user } = this.props;
		const articleData = await api.getArticle(pluralArticleKind, articleId, user.token);
		await this.setState({ articleData });
	}

	handleDelete = async () => {
		const { match, history, user } = this.props;
		const { pluralArticleKind, articleId } = match.params;
			
		await api.deleteArticle(pluralArticleKind, articleId, user.token);
		history.push('/wardrobe');
	}

	routeToArticle = async (pluralArticleKind, id) => {
		const { history } = this.props;
		history.push(`/wardrobe/${pluralArticleKind}/${id}`);
	}

	render() {
		const { match } = this.props;
		const { articleData } = this.state;

		const { pluralArticleKind, articleId } = match.params;

		const additionalBits = [];
		for (const key in articleData) {
			if (articleData[key] && !['id', 'owner', 'name', 'imageUrl', 'description', 'articleKind', 'shirts', 'pants', 'outerwears', 'dresses'].includes(key)) {
				additionalBits.push(
					<li key={ key }><strong>{ key }</strong>: { articleData[key] }</li>
				);
			} else if (['shirts', 'pants', 'dresses', 'outerwears'].includes(key)) {
				additionalBits.push(
					<div key={ key }>
						{ articleData[key].map(e => {
							return <SmallArticle key={ e.id } field={ key } id={ e.id } name={ e.name } imageUrl={ e.imageUrl } onClick={ this.routeToArticle }/>;
						}) }
					</div>
				);
			}
		}

		return (
			<main>
				<h1>{ articleData.name }</h1>

				<NavLink exact to={ `/wardrobe/${pluralArticleKind}/${articleId}/edit` }>Edit</NavLink>
				<button onClick={ this.handleDelete }>Delete</button>

				<img src={ articleData.imageUrl } alt='article'/>

				<p>{ articleData.description }</p>

				<ul>
					{ additionalBits }
				</ul>

			</main>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(ArticleDetail));
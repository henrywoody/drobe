import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import history from '../Modules/history';
import ArticlesIndex from '../Components/ArticlesIndex.jsx';
import DetailedArticle from '../Components/DetailedArticle.jsx'
import ArticleForm from '../Forms/ArticleForm.jsx';
import callAPI from '../Modules/call-api';

export default class Wardrobe extends Component {
	constructor() {
		super();
		this.state = {
			articles: []
		};
	}

	componentWillMount() {
		this.fetchArticles();
	}

	fetchArticles = async () => {
		const { user } = this.props;

		// fetch articles for user
		const [
			shirts,
			pants,
			outerwears
		] = await Promise.all([
			callAPI('shirts', null, user.token),
			callAPI('pants', null, user.token),
			callAPI('outerwears', null, user.token)
		]);

		const articles = [
			...shirts,
			...pants,
			...outerwears
		];

		this.setState({ articles });
	}

	addArticle = (article) => {
		const { articles } = this.state;
		articles.push(article);
		this.setState({ articles });
	}

	updateArticle = (article) => {
		this.removeArticle(article);
		this.addArticle(article);
	}

	removeArticle = (article) => {
		const { articles } = this.state;
		this.setState({
			articles: articles.filter(a => a._id != article._id)
		})
	}

	render() {
		const { user } = this.props;
		const { articles } = this.state;

		return (
			<main>
				<h1>Wardrobe</h1>

				<Switch>
					<Route exact path='/wardrobe' render={ props => <ArticlesIndex { ...props } articles={ articles } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId` } render={ props => <DetailedArticle { ...props } existingArticles={ articles } updateWardrobe={ {remove: this.removeArticle} } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId/edit` } render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {update: this.updateArticle} } user={ user }/> }/>
					<Route exact path='/wardrobe/new' render={ props => <ArticleForm { ...props } existingArticles={ articles } updateWardrobe={ {add: this.addArticle} } user={ user }/> } />
				</Switch>
				
			</main>
		)
	}
}
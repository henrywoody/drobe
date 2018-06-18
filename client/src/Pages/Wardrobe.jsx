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

	async fetchArticles() {
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

	render() {
		const { user } = this.props;
		const { articles } = this.state;

		return (
			<main>
				<h1>Wardrobe</h1>

				<Switch>
					<Route exact path='/wardrobe' render={ () => <ArticlesIndex articles={ articles } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId` } render={ props => <DetailedArticle { ...props } user={ user }/> }/>
					<Route exact path={ `/wardrobe/:articleKind/:articleId/edit` } render={ props => <ArticleForm { ...props } user={ user }/> }/>
					<Route exact path='/wardrobe/new' render={ props => <ArticleForm { ...props } user={ user }/> } />
				</Switch>
				
			</main>
		)
	}
}
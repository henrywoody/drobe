import React, { Component } from 'react';
import ArticlesIndex from '../Components/ArticlesIndex.jsx';
import DetailedArticle from '../Components/DetailedArticle.jsx'
import callAPI from '../Modules/call-api';

export default class Wardrobe extends Component {
	constructor() {
		super();
		this.state = {
			articles: [],
			selectedArticle: null,
			activeComponent: 'Index'
		};
	}

	async componentWillMount() {
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

	selectArticle = (article) => {
		this.setState({
			selectedArticle: article,
			activeComponent: 'Detail'
		});
	}

	render() {
		const { user } = this.props;
		const { articles, selectedArticle, activeComponent } = this.state;

		let component;
		switch (activeComponent) {
			case 'Index':
				component = <ArticlesIndex articles={ articles } selectArticle={ this.selectArticle } user={ user }/>;
				break;
			case 'Detail':
				component = <DetailedArticle data={ selectedArticle }/>;
				break;
			// case 'Edit':
			// 	component = <ArticleForm data={ selectedArticle }/>;
			// 	break;
			// case 'New':
			// 	component = <ArticleForm/>;
			// 	break;
		}

		return (
			<main>
				<h1>Wardrobe</h1>

				{ component }
			</main>
		)
	}
}
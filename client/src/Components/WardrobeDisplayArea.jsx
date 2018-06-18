import React, { Component } from 'react';
import SubNav from './SubNav.jsx';
import Article from './Article.jsx';
import callAPI from '../Modules/call-api';

export default class WardrobeDisplayArea extends Component {
	constructor() {
		super();
		this.state = {
			categories: [],
			articles: [],
			activeArticles: []
		}
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

		const activeArticles = [...articles]; // all are active to start

		const categories = ['All', ...new Set(articles.map(a => a.kind))];

		this.setState({ articles, activeArticles, categories });
	}

	filterArticles = (event) => {
		const { articles } = this.state;
		const kind = event.currentTarget.innerHTML;

		let activeArticles;
		if (kind === 'All') {
			activeArticles = articles;
		} else {
			activeArticles = articles.filter(a => a.kind === kind);			
		}

		this.setState({ activeArticles });
	}

	render() {
		const { categories, activeArticles } = this.state;
		const articleComponents = activeArticles.map(a => <Article key={ a._id } data={ a }/>);

		return (
			<div>
				<h2>Display</h2>
				<SubNav items={ categories } handleClick={ this.filterArticles }/>
				{ articleComponents }
			</div>
		);
	}
}
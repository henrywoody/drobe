import React, { Component } from 'react';
import SubNav from './SubNav.jsx';
import SimpleArticle from './SimpleArticle.jsx';
import equal from 'fast-deep-equal';

export default class ArticlesIndex extends Component {
	constructor() {
		super();
		this.state = {
			categories: [],
			activeArticles: []
		}
	}

	async componentDidUpdate(prevProps) {
		const { articles } = this.props;
		if (!equal(prevProps.articles, articles)) {
			const activeArticles = [...articles]; // all are active to start
			const categories = ['All', ...new Set(articles.map(a => a.kind))];
			this.setState({ articles, activeArticles, categories });
		}
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
		const { selectArticle } = this.props;
		const { categories, activeArticles } = this.state;
		const articleComponents = activeArticles.map(a => <SimpleArticle key={ a._id } data={ a } selectArticle={ selectArticle }/>);

		return (
			<div>
				<h2>Display</h2>
				<SubNav items={ categories } handleClick={ this.filterArticles }/>
				{ articleComponents }
			</div>
		);
	}
}
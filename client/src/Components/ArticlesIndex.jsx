import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import SubNav from './SubNav.jsx';
import SimpleArticle from './SimpleArticle.jsx';
import equal from 'fast-deep-equal';
import callAPI from '../Modules/call-api';
import fetchAllArticles from '../Modules/fetch-all-articles';

class ArticlesIndex extends Component {
	constructor() {
		super();
		this.state = {
			categories: [],
			articles: [],
			activeArticles: []
		}
	}

	async componentWillMount() {
		const { user } = this.props
		
		const articles = await fetchAllArticles(user.token);

		const activeArticles = [...articles]; // all are active to start
		const categories = ['All', ...new Set(articles.map(a => a.articleKind))];
		this.setState({ articles, activeArticles, categories });
	}

	filterArticles = (event) => {
		const { articles } = this.state;
		const articleKind = event.currentTarget.innerHTML;

		let activeArticles;
		if (articleKind === 'All') {
			activeArticles = articles;
		} else {
			activeArticles = articles.filter(a => a.articleKind === articleKind);			
		}

		this.setState({ activeArticles });
	}

	render() {
		const { history } = this.props;
		const { categories, activeArticles } = this.state;
		const articleComponents = activeArticles.map(a => <SimpleArticle key={ `${a.articleKind}-${a.id}` } data={ a } history={ history }/>);

		return (
			<div>
				<h2>Display</h2>
				<SubNav items={ categories } handleClick={ this.filterArticles }/>
				<NavLink exact to='/wardrobe/new'>New</NavLink>
				{ articleComponents }
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(ArticlesIndex));
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import SubNav from '../../Components/SubNav';
import SimpleArticle from '../../Components/SimpleArticle';
import api from '../../Modules/api';
import pluralizeArticleKind from '../../Modules/pluralize-article-kind';
import singularizeArticleKind from '../../Modules/singularize-article-kind';
import './style.css';

class ArticlesIndex extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true,
			activeCategory: 'all',
			categories: [],
			articles: [],
			activeArticles: []
		}
	}

	async componentDidMount() {
		this.fetchData();
	}

	async fetchData() {
		this.setState({isLoading: true});
		const { user } = this.props
		
		const articles = await api.getAllArticles(user.token);

		const activeArticles = [...articles]; // all are active to start
		const categories = ['all', ...new Set(articles.map(a => pluralizeArticleKind(a.articleKind)))];
		this.setState({ articles, activeArticles, categories, isLoading: false });
	}

	filterArticles = (event) => {
		const { articles } = this.state;
		const articleKind = event.currentTarget.innerHTML.toLowerCase();

		let activeArticles;
		if (articleKind === 'all') {
			activeArticles = articles;
		} else {
			activeArticles = articles.filter(a => a.articleKind === singularizeArticleKind(articleKind));			
		}

		this.setState({ activeArticles, activeCategory: articleKind });
	}

	handleNewClick = event => {
		const { history } = this.props;
		history.push('/wardrobe/new');
	}

	render() {
		const { isLoading, activeCategory, categories, activeArticles } = this.state;
		const articleComponents = activeArticles.map(e => <SimpleArticle key={ `${e.articleKind}-${e.id}` } data={ e }/>);

		const display = isLoading ? (
			<Loader/>
		) : (
			<div>
				<SubNav items={ categories } activeItem={ activeCategory } handleClick={ this.filterArticles }/>

				<div className='articles-index'>
					{ articleComponents }
				</div>
			</div>
		)

		return (
			<main>
				<h1>Wardrobe</h1>
					
				<button className='btn-primary btn-create-new' onClick={ this.handleNewClick }>Create Article</button>
				
				{ display }
			</main>
		);
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(ArticlesIndex));
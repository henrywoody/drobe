import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import DangerousButton from '../../Components/DangerousButton';
import AssociatedArticlesContainer from './AssociatedArticlesContainer.jsx';
import api from '../../Modules/api';
import './style.css';

class ArticleDetail extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true,
			articleData: {}
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	componentDidUpdate(prevProps) {
		const { pluralArticleKind: prevPluralArticleKind, articleId: prevArticleId } = prevProps.match.params;
		const { pluralArticleKind: currPluralArticleKind, articleId: currArticleId } = this.props.match.params;
		if (prevPluralArticleKind !== currPluralArticleKind || prevArticleId !== currArticleId) {
			this.fetchData();
		}
	}

	async fetchData() {
		this.setState({isLoading: true});
		const { user, match } = this.props;
		const articleData = await api.getArticle(match.params.pluralArticleKind, match.params.articleId, user.token);
		await this.setState({ articleData, isLoading: false });
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

	handleEditClick = event => {
		const { history, match } = this.props;
		const { pluralArticleKind, articleId } = match.params;
		history.push(`/wardrobe/${pluralArticleKind}/${articleId}/edit`);
	}

	render() {
		const { isLoading, articleData } = this.state;

		if (isLoading) {
			return (
				<main className='article-detail'>
					<Loader/>
				</main>
			)
		}

		return (
			<main className='article-detail'>
				<h1>{ articleData.name }</h1>

				<div className='content'>
					{ articleData.imageUrl && (
						<div className='img-container'>
							<img src={ articleData.imageUrl } alt='article'/>
						</div>
					)}

					<p>{ articleData.description }</p>

					<div className='article-attributes'>
						{ articleData.articleKind === 'outerwear' && (
							<span><span className='label accented'>Type</span> { articleData.specificKind.charAt(0).toUpperCase() + articleData.specificKind.slice(1) }</span>
						)}

						{ articleData.rating && 
							<span><span className='label accented'>Rating</span> { articleData.rating }</span>
						}

						{ (articleData.maxTemp !== null || articleData.minTemp !== null) && (
							<span>
								<span className='label accented'>Temperature</span> { articleData.minTemp !== null && <span>{ articleData.minTemp }<span className='sublabel'>min</span></span> } { articleData.maxTemp !== null && <span>{ articleData.maxTemp }<span className='sublabel'>max</span></span> }
							</span>
						)}

						<span>
							<span className='label accented'>Weather</span> <span>{ articleData.rainOk ? 'Rain Allowed' : 'Rain Not Allowed' }</span>, <span>{ articleData.snowOk ? 'Snow Allowed' : 'Snow Not Allowed' }</span>
						</span>

						{ !!articleData.shirts && !!articleData.shirts.length && (
							<div>
								<span className='label accented'>Associated Shirts</span>
								<AssociatedArticlesContainer articles={ articleData.shirts } modelName='shirts' handleClick={ this.routeToArticle }/>
							</div>
						)}

						{ !!articleData.pants && !!articleData.pants.length && (
							<div>
								<span className='label accented'>Associated Pants</span>
								<AssociatedArticlesContainer articles={ articleData.pants } modelName='pants' handleClick={ this.routeToArticle }/>
							</div>
						)}

						{ !!articleData.dresses && !!articleData.dresses.length && (
							<div>
								<span className='label accented'>Associated Dresses</span>
								<AssociatedArticlesContainer articles={ articleData.dresses } modelName='dresses' handleClick={ this.routeToArticle }/>
							</div>
						)}

						{ !!articleData.outerwears && !!articleData.outerwears.length && (
							<div>
								<span className='label accented'>Associated Outerwear</span>
								<AssociatedArticlesContainer articles={ articleData.outerwears } modelName='outerwears' handleClick={ this.routeToArticle }/>
							</div>
						)}
					</div>

					<div className='buttons-container'>
						<DangerousButton onClick={ this.handleDelete }>Delete</DangerousButton>
						<button className='btn-secondary' onClick={ this.handleEditClick }>Edit</button>
					</div>
				</div>

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
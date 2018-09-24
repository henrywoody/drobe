import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import JoinedArticlesInput from './JoinedArticlesInput.jsx';
import pluralizeArticleKind from '../../Modules/pluralize-article-kind';
import singularizeArticleKind from '../../Modules/singularize-article-kind';
import ImageInput from '../Components/ImageInput';
import api from '../../Modules/api';
import './style.css';

class ArticleForm extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: true,
			articleSearchOptions: {
				shirts: '',
				pants: '',
				dresses: '',
				outerwears: ''
			},
			articles: [],
			formData: {},
			message: null
		};
		this.initialFormData = {
			articleKind: '',
			name: '',
			description: '',
			imageUrl: '',
			rating: '1',
			minTemp: '',
			maxTemp: '',
			rainOk: false,
			snowOk: false,
			specificKind: 'sweater',
			innerLayer: false,
			shirts: [],
			pants: [],
			dresses: [],
			outerwears: []
		};
		this.isUploadingImage = false;
	}

	async componentDidMount() {
		this.scrollToTop();
		await this.resetFormData();
		this.fetchData();
	}

	scrollToTop() {
		window.scrollTo(0,0);
	}

	resetFormData() {
		this.setState({ formData: JSON.parse(JSON.stringify(this.initialFormData)) });
	}

	async fetchData() {
		this.setState({isLoading: true});
		const { match, user } = this.props;
		const { formData } = this.state;
		if (match.path !== '/wardrobe/new') {
			const { pluralArticleKind, articleId } = match.params;
			const data = await api.getArticle(pluralArticleKind, articleId, user.token);

			for (const option in data) {
				if (option in formData) {
					if (option === 'image') continue;
					if (['shirts', 'pants', 'dresses', 'outerwears'].includes(option)) {
						formData[option] = data[option].map(e => e.id);
					} else {
						formData[option] = data[option];
					}
				}
			}
		}

		const articles = await api.getAllArticles(user.token);
		this.setState({ articles, formData, isLoading: false });
	}

	clearErrorMessage = targetMessage => {
		const { message } = this.state;
		if (message === targetMessage) {
			this.setState({message: null});
		}
	}

	handleChange = async event => {
		const { name, type, value, checked } = event.target;
		const { formData } = this.state;

		const newFormData = {...formData};

		newFormData[name] = type === 'checkbox' ? checked : value;

		// setting default values dynamically
		if (name === 'specificKind') {
			if (value === 'raincoat') {
				newFormData.rainOk = true;
				newFormData.snowOk = false;
			} else if (value === 'snowcoat') {
				newFormData.snowOk = true;
				newFormData.rainOk = false;
			} else {
				newFormData.rainOk = false;
				newFormData.snowOk = false;
			}
		}

		this.setState({ formData: newFormData });
	}

	handleSubmit = async (event, routeToNewArticle) => {
		this.setState({isLoading: true});
		event.preventDefault();
		const { match, user, history } = this.props;

		await this.waitForImageUpload();
		const { formData } = this.state;

		if (!this.checkFormDataValidityAndUpdateMessage()) {
			return this.setState({isLoading: false});
		}

		let response;
		if (match.path === '/wardrobe/new') {
			const pluralArticleKind = pluralizeArticleKind(formData.articleKind);
			const articleKind = formData.articleKind;
			response = await api.postArticle(pluralArticleKind, {[articleKind]: formData}, user.token);
		} else {
			const { pluralArticleKind, articleId } = match.params;
			const articleKind = singularizeArticleKind(pluralArticleKind);
			response = await api.putArticle(pluralArticleKind, articleId, {[articleKind]: formData}, user.token);
		}

		if ('error' in response) {
			this.setState({isLoading: false});
			return this.handleError(response);
		}

		if (routeToNewArticle) {
			const { id } = response;
			const pluralArticleKind = pluralizeArticleKind(response.articleKind);
			history.push(`/wardrobe/${pluralArticleKind}/${id}`);
		} else {
			await this.resetFormData();
			this.setState({isLoading: false});
		}
	}

	waitForImageUpload = async () => {
		if (this.isUploadingImage) {
			return new Promise(resolve => {
				setTimeout(async () => {
					await this.waitForImageUpload();
					resolve();
				}, 100);
			});
		}
	}

	clearImage = event => {
		event.preventDefault();
		const { formData } = this.state;
		this.setState({
			formData: {
				...formData,
				imageUrl: ''
			}
		});
	}

	checkFormDataValidityAndUpdateMessage() {
		const { formData } = this.state;

		if (!formData.name) {
			this.setState({message: 'Name cannot be blank.'});
			return false;
		}
		if (formData.maxTemp !== '' && formData.minTemp !== '' && Number(formData.minTemp) > Number(formData.maxTemp)) {
			this.setState({message: 'Minimum temperature cannot exceed maximum temperature.'});
			return false
		}
		return true;
	}

	handleError(response) {
		this.setState({message: response.message || response.error, isLoading: false});
		this.scrollToTop();
	}

	handleCancel = event => {
		event.preventDefault();
		const { match, history } = this.props;
		const { pluralArticleKind, articleId } = match.params;

		if (match.path === '/wardrobe/new') {
			history.push('/wardrobe');
		} else {
			history.push(`/wardrobe/${pluralArticleKind}/${articleId}`);
		}
	}

	handleSearchChange = (event) => {
		const { name, value } = event.target;
		const { articleSearchOptions } = this.state;

		articleSearchOptions[name] = value;
		this.setState({ articleSearchOptions });
	}

	filterAddedArticles(fieldName) {
		const { articles, formData } = this.state;
		return articles.filter(e => {
			return e.articleKind === singularizeArticleKind(fieldName) && formData[fieldName].includes(e.id); // note: need both kind and id because ids are only unique within a kind
		});
	}

	filterArticleSuggestions(fieldName) {
		const { articles, articleSearchOptions, formData } = this.state;
		return articles.filter(e => {
			return e.articleKind === singularizeArticleKind(fieldName) && !formData[fieldName].includes(e.id) && e.name.match(new RegExp(`^${articleSearchOptions[fieldName]}`, 'i'));
		});
	}

	addAssociatedArticle = (fieldName, id) => {
		const { formData } = this.state;
		formData[fieldName].push(id);
		formData[fieldName] = [...new Set(formData[fieldName])];
		this.setState({ formData });
	}

	removeAssociatedArticle = (fieldName, id) => {
		const { formData } = this.state;
		formData[fieldName].splice(formData[fieldName].indexOf(id), 1);
		this.setState({ formData });
	}

	render() {
		const { match } = this.props;
		const { isLoading, articleSearchOptions, formData, message } = this.state;

		if (isLoading) {
			return <Loader/>
		}

		let articleKindField;

		if (match.path === '/wardrobe/new') {
			articleKindField = (
				<div className='input-container'>
					<label htmlFor='articleKind'>Kind</label>
					<div className='radio-container'>
						<input type='radio' name='articleKind' id='shirt' value='shirt' checked={ formData.articleKind === 'shirt' } onChange={ this.handleChange }/>
						<label htmlFor='shirt'>Shirt</label>
						<input type='radio' name='articleKind' id='pants' value='pants' checked={ formData.articleKind === 'pants' } onChange={ this.handleChange }/>
						<label htmlFor='pants'>Pants</label>
						<input type='radio' name='articleKind' id='dress' value='dress' checked={ formData.articleKind === 'dress' } onChange={ this.handleChange }/>
						<label htmlFor='dress'>Dress</label>
						<input type='radio' name='articleKind' id='outerwear' value='outerwear' checked={ formData.articleKind === 'outerwear' } onChange={ this.handleChange }/>
						<label htmlFor='outerwear'>Outerwear</label>
					</div>
				</div>
			)

			if (!formData.articleKind) {
				return (
					<form>
						{ articleKindField }
						<button className='btn-secondary' onClick={ this.handleCancel }>Cancel</button>
					</form>
				)
			}
		}

		let additionalFields = {};
		if (formData.articleKind === 'outerwear') {
			additionalFields.specificKind = (
				<div className='input-container'>
					<label htmlFor='specificKind'>Specific Kind</label>
					<div className='radio-container specific-kind-radio'>
						<input type='radio' name='specificKind' id='sweater' value='sweater' checked={ formData.specificKind === 'sweater' } onChange={ this.handleChange }/>
						<label htmlFor='sweater'>Sweater</label>
						<input type='radio' name='specificKind' id='jacket' value='jacket' checked={ formData.specificKind === 'jacket' } onChange={ this.handleChange }/>
						<label htmlFor='jacket'>Jacket</label>
						<input type='radio' name='specificKind' id='vest' value='vest' checked={ formData.specificKind === 'vest' } onChange={ this.handleChange }/>
						<label htmlFor='vest'>Vest</label>
						<input type='radio' name='specificKind' id='raincoat' value='raincoat' checked={ formData.specificKind === 'raincoat' } onChange={ this.handleChange }/>
						<label htmlFor='raincoat'>Raincoat</label>
						<input type='radio' name='specificKind' id='snowcoat' value='snowcoat' checked={ formData.specificKind === 'snowcoat' } onChange={ this.handleChange }/>
						<label htmlFor='snowcoat'>Snowcoat</label>
					</div>
				</div>
			);
		}


		// Added Articles
		const addedShirts = this.filterAddedArticles('shirts');
		const addedPants = this.filterAddedArticles('pants');
		const addedDresses = this.filterAddedArticles('dresses');
		const addedOuterwears = this.filterAddedArticles('outerwears');

		// Suggested (not yet added) Articles
		const shirtSuggestions = this.filterArticleSuggestions('shirts');
		const pantsSuggestions = this.filterArticleSuggestions('pants');
		const dressSuggestions = this.filterArticleSuggestions('dresses');
		const outerwearSuggestions = this.filterArticleSuggestions('outerwears');

		// Form Fields for Associat(ing/ed) Articles
		let associatedArticleFields = [];
		if (['pants', 'outerwear'].includes(formData.articleKind)) {
			associatedArticleFields.push(
				<JoinedArticlesInput key='shirtsField'
					fieldName='shirts'
					label={ <label htmlFor='shirts'>Associated Shirts</label> }
					addedArticles={ addedShirts }
					searchInput={ <input name='shirts' type='search' placeholder='Search' value={ articleSearchOptions.shirts || '' } onChange={ this.handleSearchChange }/> }
					suggestedArticles={ shirtSuggestions }
					addArticle={ this.addAssociatedArticle }
					removeArticle={ this.removeAssociatedArticle }
				/>
			);
		}
		if (['shirt', 'outerwear'].includes(formData.articleKind)) {
			associatedArticleFields.push(
				<JoinedArticlesInput key='pantsField'
					fieldName='pants'
					label={ <label htmlFor='pants'>Associated Pants</label> }
					addedArticles={ addedPants }
					searchInput={ <input name='pants' type='search' placeholder='Search' value={ articleSearchOptions.pants || '' } onChange={ this.handleSearchChange }/> }
					suggestedArticles={ pantsSuggestions }
					addArticle={ this.addAssociatedArticle }
					removeArticle={ this.removeAssociatedArticle }
				/>
			)
		}
		if (['outerwear'].includes(formData.articleKind)) {
			associatedArticleFields.push(
				<JoinedArticlesInput key='dressesField'
					fieldName='dresses'
					label={ <label htmlFor='dresses'>Associated Dresses</label> }
					addedArticles={ addedDresses }
					searchInput={ <input name='dresses' type='search' placeholder='Search' value={ articleSearchOptions.dresses || '' } onChange={ this.handleSearchChange }/> }
					suggestedArticles={ dressSuggestions }
					addArticle={ this.addAssociatedArticle }
					removeArticle={ this.removeAssociatedArticle }
				/>
			);
		}
		if (['shirt', 'pants', 'dress', 'outerwear'].includes(formData.articleKind)) {
			associatedArticleFields.push(
				<JoinedArticlesInput key='outerwearsField'
					fieldName='outerwears'
					label={ <label htmlFor='outerwears'>Associated Outerwear</label> }
					addedArticles={ addedOuterwears }
					searchInput={ <input name='outerwears' type='search' placeholder='Search' value={ articleSearchOptions.outerwears || '' } onChange={ this.handleSearchChange }/> }
					suggestedArticles={ outerwearSuggestions }
					addArticle={ this.addAssociatedArticle }
					removeArticle={ this.removeAssociatedArticle }
				/>
			);
		}

		const submitButtons = match.path === '/wardrobe/new' ? (
			[
				<button key='create' className='btn-primary' onClick={ e => this.handleSubmit(e, true)}>Create</button>,
				<button key='another' className='btn-secondary' onClick={ e => this.handleSubmit(e, false)}>Create and Add Another</button>
			]
		) : (
			[
				<button key='update' className='btn-primary' onClick={ e => this.handleSubmit(e, true)}>Update</button>
			]
		);

		let namePlaceholder = formData.articleKind === 'outerwear' ? formData.specificKind : formData.articleKind;
		namePlaceholder = namePlaceholder.charAt(0).toUpperCase() + namePlaceholder.slice(1);

		return (
			<form>
				<span className='danger'>{ message }</span>

				{ articleKindField }

				{ additionalFields.specificKind }

				<div className='input-container'>
					<label htmlFor='name'>Name</label>
					<input name='name' type='text' value={ formData.name || '' } placeholder={ `My Great ${namePlaceholder}` } onChange={ this.handleChange }/>
				</div>

				<div className='input-container'>
					<label htmlFor='description'>Description <span className='optional'>optional</span></label>
					<textarea name='description' value={ formData.description || '' } placeholder='Something descriptive' onChange={ this.handleChange }/>
				</div>

				<ImageInput
					ref='imageInput'
					imageUrl={ formData.imageUrl }
					handleChange={ imageUrl => this.setState({formData: {...formData, imageUrl}})}
					clearErrorMessage={ this.clearErrorMessage }
					handleError={ message => this.setState({ message })}
					toggleUploadingStatus={ () =>  this.isUploadingImage = !this.isUploadingImage }
				/>

				{ formData.imageUrl && <button className='btn-secondary btn-clear-image' onClick={ this.clearImage }>Clear Image</button> }

				<div className='input-container'>
					<label htmlFor='rating'>Rating</label>
					<input name='rating' type='range' min='1' max='5' value={ formData.rating || '' } onChange={ this.handleChange }/>
					<input name='rating' type='number' min='1' max='5' value={ formData.rating || '' } onChange={ this.handleChange }/>
				</div>

				<div className='input-container'>
					<label>Temperature Range <span className='optional'>optional</span></label>
					<div className='input-grouping always-row temp-inputs-container'>
						<input name='minTemp' type='number' placeholder='Min Temp' value={ formData.minTemp || '' } onChange={ this.handleChange }/>
						<input name='maxTemp' type='number' placeholder='Max Temp' value={ formData.maxTemp || '' } onChange={ this.handleChange }/>
					</div>
				</div>

				<div className='input-grouping always-row'>
					<div className='input-container'>
						<label htmlFor='rainOk'>Rain</label>
						<input name='rainOk' type='checkbox' checked={ formData.rainOk } onChange={ this.handleChange }/>
					</div>

					<div className='input-container'>
						<label htmlFor='snowOk'>Snow</label>
						<input name='snowOk' type='checkbox' checked={ formData.snowOk } onChange={ this.handleChange }/>
					</div>
				</div>

				{ associatedArticleFields }

				<div className='buttons-container buttons-container-final'>
					{ submitButtons }
					<button className='btn-secondary' onClick={ this.handleCancel }>Cancel</button>
				</div>
			</form>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(ArticleForm));
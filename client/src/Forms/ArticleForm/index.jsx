import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import JoinedArticlesInput from './JoinedArticlesInput.jsx';
import pluralizeArticleKind from '../../Modules/pluralize-article-kind';
import singularizeArticleKind from '../../Modules/singularize-article-kind';
import api from '../../Modules/api';
import uploadImage from '../../Modules/upload-image';
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
			initialFormData: {
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
			},
			formData: {},
			image: {
				path: '',
				data: null
			},
			message: null
		};
	}

	async componentDidMount() {
		await this.resetFormData();
		this.fetchData();
	}

	resetFormData() {
		const { initialFormData } = this.state;
		this.setState({ formData: {...initialFormData} });
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

	handleChange = async (event) => {
		const { name, type, value, checked } = event.target;
		const { formData, image, message } = this.state;
		let newMessage = '';

		const newFormData = {...formData};

		if (name === 'image') { // handling image upload
			const imageTooLargeMessage = 'Image is too large, must be less than 16 MB.';
			const file = event.target.files[0];

			if (!file) {
				image.path = '';
				image.data = null;
			} else if (file.size >= 16 * 1024 * 1024) { // max file size 16MB
				image.data = '';
				return this.setState({
					message: imageTooLargeMessage,
					formData: newFormData
				});
			} else {
				if (message === imageTooLargeMessage)
					newMessage = null;

				image.path = value;
				image.data = file;
			}
		} else {
			newFormData[name] = type === 'checkbox' ? checked : value;
		}

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

		this.setState({ formData: newFormData, image, message: newMessage });
	}

	handleSubmit = async (event, routeToNewArticle) => {
		this.setState({isLoading: true});
		event.preventDefault();
		const { match, user, history } = this.props;
		const { formData, image } = this.state;

		// Validation
		if (!formData.name) {
			return this.setState({message: 'Name cannot be blank.'})
		}
		if (formData.maxTemp !== '' && formData.minTemp !== '' && Number(formData.minTemp) > Number(formData.maxTemp)) {
			return this.setState({message: 'Minimum temperature cannot exceed maximum temperature.'})
		}

		// Upload
		// upload image first if there is one
		if (image.data) {
			const imageResponse = await uploadImage(image, user.token);
			if (imageResponse.error) {
				return this.setState({message: 'There was a problem with the image upload, please try again or select a different image.'});
			}
			formData.imageUrl = imageResponse.imageUrl;
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
			return this.handleError(response.error);
		}

		if (routeToNewArticle) {
			const { id } = response;
			const pluralArticleKind = pluralizeArticleKind(response.articleKind);
			history.push(`/wardrobe/${pluralArticleKind}/${id}`);
		} else {
			this.resetFormData();
		}
	}

	handleError(message) {
		this.setState({ message });
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
		const { isLoading, articleSearchOptions, formData, image, message } = this.state;

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
				{ message }

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

				<div className='input-container'>
					<label htmlFor='image'>Image <span className='optional'>optional</span></label>
					<input name='image' type='file' value={ image.path || '' } onChange={ this.handleChange }/>
				</div>

				<div className='input-container'>
					<label htmlFor='rating'>Rating</label>
					<input name='rating' type='range' min='1' max='5' value={ formData.rating || '' } onChange={ this.handleChange }/>
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
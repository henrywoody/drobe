import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import SmallArticle from '../Components/SmallArticle.jsx';

export default class ArticleForm extends Component {
	constructor() {
		super();
		this.state = {
			articleKinds: ['shirt', 'pants', 'outerwear'],
			articleSearchOptions: {
				shirts: '',
				pants: '',
				outerwears: ''
			},
			formOptions: {
				articleKind: 'shirt',
				name: '',
				description: '',
				image: {
					path: '',
					data: null
				},
				rating: '0',
				color: '',
				minTemp: 50,
				maxTemp: 100,
				rainOK: false,
				snowOK: false,
				specificType: 'sweater',
				innerLayer: false,
				shirts: [],
				pants: [],
				outerwears: []
			},
			message: null
		};
	}

	async componentWillMount() {
		const { match, user } = this.props;
		const { formOptions } = this.state;
		if (match.path !== '/wardrobe/new') {
			const { pluralArticleKind, articleId } = match.params;
			const data = await callAPI(`${pluralArticleKind}/${articleId}`, null, user.token);

			for (const option in data) {
				if (option in formOptions) {
					if (option === 'image') continue;
					formOptions[option] = data[option];
				}
			}
		}
		this.setState({ formOptions });
	}

	handleChange = async (event) => {
		const { name, type, value, checked } = event.target;
		const { formOptions, message } = this.state;
		let newMessage = message;

		// handling checkboxes
		if (type === 'checkbox') {
			formOptions[name] = checked;
		} else if (name === 'image') { // handling image upload
			const imageTooLargeMessage = 'Image is too large, must be less than 16 MB.';
			const file = event.target.files[0];
			console.log(file)

			if (file.size >= 16 * 1024 * 1024) { // max file size 16MB
				formOptions.image.data = '';
				return this.setState({
					message: imageTooLargeMessage,
					formOptions
				});
			}

			if (message === imageTooLargeMessage)
				newMessage = null;

			formOptions.image = {
				path: value,
				data: file
			}

		} else {
			formOptions[name] = value;
		}

		// handling min/max values
		if (name === 'minTemp' && Number(formOptions.maxTemp) < Number(formOptions.minTemp)) {
			formOptions.maxTemp = value;
		} else if (name === 'maxTemp' && Number(formOptions.minTemp) > Number(formOptions.maxTemp)) {
			formOptions.minTemp = value;
		}

		// setting default values dynamically
		if (name === 'specificType') {
			if (value === 'raincoat') {
				formOptions.rainOK = true;
				formOptions.snowOK = false;
			} else if (value === 'snowcoat') {
				formOptions.snowOK = true;
				formOptions.rainOK = false;
			} else {
				formOptions.rainOK = false;
				formOptions.snowOK = false;
			}
		}
		this.setState({ formOptions, message: newMessage });
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const { match, user, history } = this.props;
		const { formOptions } = this.state;

		let endpoint, method, articleKind;
		if (match.path === '/wardrobe/new') {
			endpoint = formOptions.articleKind + (formOptions.articleKind === 'pants' ? '' : 's');
			method = 'POST';
			articleKind = formOptions.articleKind;
		} else {
			const { pluralArticleKind, articleId } = match.params;
			articleKind = pluralArticleKind === 'pants' ? pluralArticleKind : pluralArticleKind.slice(0, -1);
			endpoint = `${pluralArticleKind}/${articleId}`;
			method = 'PUT';
		}

		const response = await callAPI(endpoint, null, user.token, method, {[articleKind]: formOptions});

		if (response.error) {
			this.handleError(response.error);
		} else {
			const { updateWardrobe } = this.props;
			if (match.path === '/wardrobe/new') {
				updateWardrobe.add(response);
			} else {
				updateWardrobe.update(response);
			}

			const { id } = response;
			const pluralArticleKind = response.articleKind + (response.articleKind === 'pants' ? '' : 's');
			history.replace(`/wardrobe/${pluralArticleKind}/${id}`);
		}
	}

	handleError(message) {
		this.setState({ message });
	}

	handleCancel = () => {
		const { match, history } = this.props;
		const { pluralArticleKind, articleId } = match.params;

		if (match.path === '/wardrobe/new') {
			history.replace('/wardrobe');
		} else {
			history.replace(`/wardrobe/${pluralArticleKind}/${articleId}`);
		}
	}

	handleSearchChange = (event) => {
		const { name, value } = event.target;
		const { articleSearchOptions } = this.state;

		articleSearchOptions[name] = value;
		this.setState({ articleSearchOptions });
	}

	addAssociatedArticle = (fieldName, id) => {
		const { formOptions } = this.state;
		formOptions[fieldName].push(id);
		formOptions[fieldName] = [...new Set(formOptions[fieldName])];
		this.setState({ formOptions });
	}

	removeAssociatedArticle = (fieldName, id) => {
		const { formOptions } = this.state;
		formOptions[fieldName].splice(formOptions[fieldName].indexOf(id), 1);
		this.setState({ formOptions });
	}

	render() {
		const { existingArticles, match } = this.props;
		const { articleKinds, articleSearchOptions, formOptions, message } = this.state;
		
		const articleKindOptions = articleKinds.map(articleKind => {
			return <option key={ articleKind } value={ articleKind }>{ articleKind }</option>
		});

		const articleKindField = match.path === '/wardrobe/new' ? (
			<div>
				<label htmlFor='articleKind'>Kind</label>
				<select name='articleKind' value={ formOptions.articleKind } onChange={ this.handleChange }>
					{ articleKindOptions }
				</select>
			</div>
		) : ( null )

		let additionalFields = {};
		if (formOptions.articleKind === 'outerwear') {
			additionalFields.specificType = (
				<div>
					<label htmlFor='specificType'>Specific Kind</label>
					<select name='specificType' value={ formOptions.specificType } onChange={ this.handleChange }>
						{['sweater', 'jacket', 'vest', 'raincoat', 'snowcoat'].map(type => {
							return <option key={ type } value={ type }>{ type }</option>;
						})}
					</select>
				</div>
			);

			additionalFields.innerLayer = (
				<div>
					<label htmlFor='innerLayer'>Inner Layer</label>
					<input name='innerLayer' type='checkbox' checked={ formOptions.innerLayer } onChange={ this.handleChange }/>
				</div>
			)
		}


		// Added Articles
		const addedShirts = existingArticles.filter(a => {
			return formOptions.shirts.includes(a.id);
		}).map(s => {
			return <SmallArticle key={ s.id } field={ 'shirts' } id={ s.id } name={ s.name } image={ s.image } onClick={ this.removeAssociatedArticle }/>
		});

		const addedPants = existingArticles.filter(a => {
			return formOptions.pants.includes(a.id);
		}).map(s => {
			return <SmallArticle key={ s.id } field={ 'pants' } id={ s.id } name={ s.name } image={ s.image } onClick={ this.removeAssociatedArticle }/>
		});

		const addedOuterwears = existingArticles.filter(a => {
			return formOptions.outerwears.includes(a.id);
		}).map(s => {
			return <SmallArticle key={ s.id } field={ 'outerwears' } id={ s.id } name={ s.name } image={ s.image } onClick={ this.removeAssociatedArticle }/>
		})


		// Suggested (not yet added) Articles
		const shirtSuggestions = existingArticles.filter(a => {
			return a.articleKind === 'shirt' && !formOptions.shirts.includes(a.id) && a.name.match(new RegExp(`^${articleSearchOptions.shirts}`, 'i'));
		}).map(s => {
			return <SmallArticle key={ s.id } field={ 'shirts' } id={ s.id } name={ s.name } image={ s.image } onClick={ this.addAssociatedArticle }/>
		});

		const pantsSuggestions = existingArticles.filter(a => {
			return a.articleKind === 'pants' && !formOptions.pants.includes(a.id) && a.name.match(new RegExp(`^${articleSearchOptions.pants}`, 'i'));
		}).map(p => {
			return <SmallArticle key={ p.id } field={ 'pants' } id={ p.id } name={ p.name } image={ p.image } onClick={ this.addAssociatedArticle }/>
		});

		const outerwearSuggestions = existingArticles.filter(a => {
			return a.articleKind === 'outerwear' && !formOptions.outerwears.includes(a.id) && a.name.match(new RegExp(`^${articleSearchOptions.outerwears}`, 'i'));
		}).map(p => {
			return <SmallArticle key={ p.id } field={ 'outerwears' } id={ p.id } name={ p.name } image={ p.image } onClick={ this.addAssociatedArticle }/>
		});

		// Form Fields for Associat(ing/ed) Articles
		let associatedArticleFields = [];
		if (['pants', 'outerwear'].includes(formOptions.articleKind)) {
			associatedArticleFields.push(
				<div key='shirtsField'>

					{ addedShirts }

					<label htmlFor='shirts'>Shirts</label>
					<input name='shirts' type='search' value={ articleSearchOptions.shirts } onChange={ this.handleSearchChange }/>

					{ shirtSuggestions }

				</div>
			);
		}
		if (['shirt', 'outerwear'].includes(formOptions.articleKind)) {
			associatedArticleFields.push(
				<div key='pantsField'>

					{ addedPants }

					<label htmlFor='pants'>Pants</label>
					<input name='pants' type='search' value={ articleSearchOptions.pants } onChange={ this.handleSearchChange }/>

					{ pantsSuggestions }

				</div>
			);
		}
		if (['shirt', 'pants', 'outerwear'].includes(formOptions.articleKind)) {
			associatedArticleFields.push(
				<div key='outerwearsField'>

					{ addedOuterwears}

					<label htmlFor='outerwears'>Outerwear</label>
					<input name='outerwears' type='search' value={ articleSearchOptions.outerwears } onChange={ this.handleSearchChange }/>

					{ outerwearSuggestions }

				</div>
			);
		}

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }

				{ articleKindField }

				{ additionalFields.specificType }

				<label htmlFor='name'>Name</label>
				<input name='name' type='text' value={ formOptions.name } placeholder='name' onChange={ this.handleChange }/>

				<label htmlFor='description'>Description</label>
				<textarea name='description' value={ formOptions.description } placeholder='description' onChange={ this.handleChange }/>

				<label htmlFor='image'>Image</label>
				<input name='image' type='file' value={ formOptions.image.path } onChange={ this.handleChange }/>

				<label htmlFor='rating'>Rating</label>
				<input name='rating' type='range' min='0' max='5' value={ formOptions.rating } onChange={ this.handleChange }/>

				<label htmlFor='color'>Color</label>
				<input name='color' type='text' value={ formOptions.color } placeholder='color' onChange={ this.handleChange }/>

				<label>Temperature Range</label>
				<input name='minTemp' type='number' value={ formOptions.minTemp } onChange={ this.handleChange }/>
				<input name='maxTemp' type='number' value={ formOptions.maxTemp } onChange={ this.handleChange }/>

				{ additionalFields.innerLayer }

				<label htmlFor='rainOK'>Rain</label>
				<input name='rainOK' type='checkbox' checked={ formOptions.rainOK } onChange={ this.handleChange }/>

				<label htmlFor='snowOK'>Snow</label>
				<input name='snowOK' type='checkbox' checked={ formOptions.snowOK } onChange={ this.handleChange }/>

				{ associatedArticleFields }

				<input type='submit'/>

				<button onClick={ this.handleCancel }>Cancel</button>
			</form>
		)
	}
}
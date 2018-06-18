import React, { Component } from 'react';
import callAPI from '../Modules/call-api';

export default class ArticleForm extends Component {
	constructor() {
		super();
		this.state = {
			articleKinds: ['Shirt', 'Pants', 'Outerwear'],
			formOptions: {
				kind: 'Shirt',
				name: '',
				description: '',
				image: '',
				rating: '0',
				color: '',
				minTemp: 50,
				maxTemp: 100,
				rainOK: false,
				snowOK: false,
				specificType: 'sweater',
				innerLayer: false
			},
			message: null
		};
	}

	async componentWillMount() {
		const { match, user } = this.props;
		const { formOptions } = this.state;
		if (match.path !== '/wardrobe/new') {
			const { articleKind, articleId } = match.params;
			const data = await callAPI(`${articleKind}/${articleId}`, null, user.token);

			for (const option in formOptions) {
				formOptions[option] = data[option];
			}
		}
		this.setState({ formOptions });
	}

	handleChange = (event) => {
		const { name, type, value, checked } = event.target;
		const { formOptions } = this.state;

		// handling checkboxes
		if (type === 'checkbox') {
			formOptions[name] = checked;
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
		this.setState({ formOptions });
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const { match, user } = this.props;
		const { formOptions } = this.state;

		let response;
		if (match.path === '/wardrobe/new') {
			const endpoint = formOptions.kind.toLowerCase() + (formOptions.kind === 'Pants' ? '' : 's');
			response = await callAPI(endpoint, null, user.token, 'POST', {[formOptions.kind.toLowerCase()]: formOptions});
		} else {
			const { articleKind, articleId } = match.params;
			const endpoint = `${articleKind}/${articleId}`;
			response = await callAPI(endpoint, null, user.token, 'PUT', {[formOptions.kind.toLowerCase()]: formOptions});
		}
		if (response.error)
			this.handleError(response.error);
	}

	handleError(message) {
		this.setState({ message });
	}

	render() {
		const { articleKinds, formOptions, message } = this.state;

		const articleKindOptions = articleKinds.map(kind => {
			return <option key={ kind } value={ kind }>{ kind }</option>
		});

		let additionalFields = {};
		if (formOptions.kind === 'Outerwear') {
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
					<input type='checkbox' checked={ formOptions.innerLayer }/>
				</div>
			)
		}

		return (
			<form onSubmit={ this.handleSubmit }>
				{ message }

				<label htmlFor='kind'>Kind</label>
				<select name='kind' value={ formOptions.kind } onChange={ this.handleChange }>
					{ articleKindOptions }
				</select>

				{ additionalFields.specificType }

				<label htmlFor='name'>Name</label>
				<input name='name' type='text' value={ formOptions.name } placeholder='name' onChange={ this.handleChange }/>

				<label htmlFor='description'>Description</label>
				<textarea name='description' value={ formOptions.description } placeholder='description' onChange={ this.handleChange }/>

				<label htmlFor='image'>Image</label>
				<input name='image' type='url' value={ formOptions.image } placeholder='http://image.com/image' onChange={ this.handleChange }/>

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

				<input type='submit'/>
			</form>
		)
	}
}
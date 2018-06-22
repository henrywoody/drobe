import React, { Component } from 'react';
import callAPI from '../Modules/call-api';
import history from '../Modules/history';
import SimpleArticle from './SimpleArticle.jsx';

export default class OutfitGenerator extends Component {
	constructor() {
		super();
		this.state = {
			outfit: {},
			loading: false
		}
	}

	generateOutfit = async () => {
		await this.setState({ loading: true });
		const { user } = this.props;
		const outfit = await callAPI('outfits/today', null, user.token);
		this.setState({ outfit, loading: false });
	}

	handleSelect = () => {
		const { user } = this.props;
		const { outfit } = this.state;

		const newDate = Date.now();

		if (outfit.outerwears && outfit.outerwears.length) {
			for (const outerwear of outfit.outerwear) {
				const endpoint = `outerwears/${outerwear._id}`;
				callAPI(endpoint, null, user.token, 'PUT', {
					outerwear: {
								...outerwear,
								lastWorn: newDate,
								wearDates: [...outerwear.wearDates, newDate]
						}
					}
				)
			}
		}
		if (outfit.shirt) {
			const endpoint = `shirts/${outfit.shirt._id}`;
			callAPI(endpoint, null, user.token, 'PUT', {
				shirt: {
					...outfit.shirt,
					lastWorn: newDate,
					wearDates: [...outfit.shirt.wearDates, newDate]
				}
			})
		}

		if (outfit.pants) {
			const endpoint = `pants/${outfit.pants._id}`;
			callAPI(endpoint, null, user.token, 'PUT', {
				pants: {
					...outfit.pants,
					lastWorn: newDate,
					wearDates: [...outfit.pants.wearDates, newDate]
				}
			})
		}
	}

	render() {
		const { outfit, loading } = this.state;
		
		let outfitDisplay;

		if (loading) {
			outfitDisplay = <p>Loading...</p>;
		} else {
			outfitDisplay = [];
			if (outfit.outerwears && outfit.outerwears.length)
				outfitDisplay.push(...outfit.outerwears.map(o => {
					return <SimpleArticle key={ o._id } data={ o } history={ history }/>;
				}));

			if (outfit.shirt)
				outfitDisplay.push(<SimpleArticle key={ outfit.shirt._id } data={ outfit.shirt } history={ history }/>);
			if (outfit.pants)
				outfitDisplay.push(<SimpleArticle key={ outfit.pants._id } data={ outfit.pants } history={ history }/>);

			if (outfit.shirt || outfit.pants)
				outfitDisplay.push(<button key='wear-button' onClick={ this.handleSelect }>Wear</button>)
		}

		return (
			<div>
				<h2>Outfit</h2>
				{  outfitDisplay  }
				<button onClick={ this.generateOutfit }>Generate Outfit</button>
			</div>
		)
	}
}
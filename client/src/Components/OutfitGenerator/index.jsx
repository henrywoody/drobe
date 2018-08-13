import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import api from '../../Modules/api';
import SimpleArticle from '../SimpleArticle';

class OutfitGenerator extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
			outfit: {},
			noArticles: false
		}
	}

	generateOutfit = async () => {
		const { user } = this.props;

		await this.setState({ isLoading: true });

		const outfit = await api.getOutfit(user.token);
		if ('error' in outfit) {
			this.setState({noArticles: true, isLoading: false});
		} else {
			this.setState({ outfit, isLoading: false });
		}
	}

	handleSelect = () => {
		const { user } = this.props;
		const { outfit } = this.state;
		api.wearOutfit(outfit, user.token);
	}

	render() {
		const { isLoading, outfit, noArticles } = this.state;

		let outfitDisplay;

		if (isLoading) {
			outfitDisplay = <span>Loading...</span>;
		} else if (noArticles) {
			outfitDisplay = <span>You don't have enough articles saved to make an outfit. <Link to='/wardrobe/new'>Add an article</Link>.</span>
		} else {
			outfitDisplay = [];
			if (outfit.outerwear && outfit.outerwear.length) {
				outfitDisplay.push(<h3 key={ `outerwear-${Math.random()}` }>Outerwear</h3>);
				outfitDisplay.push(...outfit.outerwear.map(e => {
					return <SimpleArticle key={ e.id } data={ e }/>;
				}));
			}

			if (outfit.shirt) {
				outfitDisplay.push(<h3 key='shirt'>Shirt</h3>);
				outfitDisplay.push(<SimpleArticle key={ `shirt-${outfit.shirt.id}` } data={ outfit.shirt }/>);
			}
			if (outfit.pants) {
				outfitDisplay.push(<h3 key='pants'>Pants</h3>);
				outfitDisplay.push(<SimpleArticle key={ `pants-${outfit.pants.id}` } data={ outfit.pants }/>);
			}

			if (outfit.dress) {
				outfitDisplay.push(<h3 key='dress'>Dress</h3>);
				outfitDisplay.push(<SimpleArticle key={ `dress-${outfit.dress.id}` } data={ outfit.dress }/>);
			}

			if (outfit.shirt || outfit.dress)
				outfitDisplay.push(<button className='btn-primary' key='wear-button' onClick={ this.handleSelect }>Wear</button>);

			outfitDisplay.push(<button className={ Object.keys(outfit).length ? 'btn-secondary' : 'btn-primary' } key='generate' onClick={ this.generateOutfit }>Generate Outfit</button>);
		}

		return (
			<div className='component'>
				<h2>Outfit</h2>

				{  outfitDisplay  }
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default connect(mapStateToProps)(OutfitGenerator);
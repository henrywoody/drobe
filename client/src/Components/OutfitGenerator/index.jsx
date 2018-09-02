import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../Loader';
import SimpleArticle from '../SimpleArticle';
import api from '../../Modules/api';
import './style.css';

class OutfitGenerator extends Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
			showMessage: false,
			outfit: {},
			noArticles: false
		}
	}

	generateOutfit = async () => {
		const { user } = this.props;

		await this.setState({ isLoading: true, showMessage: false });

		const outfit = await api.getOutfit(user.token);
		const noArticles = !(outfit.shirt || outfit.pants || outfit.dress || outfit.outerwear.length);
		if ('error' in outfit || noArticles) {
			this.setState({noArticles: true, isLoading: false});
		} else {
			this.setState({ outfit, isLoading: false });
		}
	}

	handleSelect = () => {
		const { user } = this.props;
		const { outfit } = this.state;
		api.wearOutfit(outfit, user.token);
		this.setState({ showMessage: true });
	}

	render() {
		const { isLoading, showMessage, outfit, noArticles } = this.state;

		let outfitDisplay;

		if (isLoading) {
			outfitDisplay = <Loader/>;
		} else if (noArticles) {
			outfitDisplay = <span>You don't have enough articles saved to make an outfit. <Link to='/wardrobe/new'>Add an article</Link>.</span>
		} else {
			outfitDisplay = (
				<div>
					{ outfit.outerwear && !!outfit.outerwear.length && (
						<div className='outfit-row'>
							<h3>Outerwear</h3>

							<div className='articles-container'>
								{ outfit.outerwear.map(e => <SimpleArticle key={ e.id } data={e}/>) }
							</div>
						</div>
					)}

					{ outfit.shirt && (
						<div className='outfit-row'>
							<h3>Shirt</h3>

							<div className='articles-container'>
								<SimpleArticle data={ outfit.shirt }/>
							</div>
						</div>
					)}

					{ outfit.pants && (
						<div className='outfit-row'>
							<h3>Pants</h3>

							<div className='articles-container'>
								<SimpleArticle data={ outfit.pants }/>
							</div>
						</div>
					)}

					{ outfit.dress && (
						<div className='outfit-row'>
							<h3>Dress</h3>

							<div className='articles-container'>
								<SimpleArticle data={ outfit.dress }/>
							</div>
						</div>
					)}

					{ showMessage && (
						<p className='message'>Nice choice, you'll look great.</p>
					)}

					<div className='buttons-container buttons-container-final'>
						{ (outfit.shirt || outfit.dress) && (
							<button className='btn-primary' key='wear-button' onClick={ this.handleSelect }>Wear</button>
						)}
						<button className={ Object.keys(outfit).length ? 'btn-secondary' : 'btn-primary' } key='generate' onClick={ this.generateOutfit }>Generate Outfit</button>
					</div>
				</div>
			)
		}

		return (
			<div className='component outfit-generator'>
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
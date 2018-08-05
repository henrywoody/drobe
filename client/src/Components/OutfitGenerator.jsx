import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import callAPI from '../Modules/call-api';
import SimpleArticle from './SimpleArticle.jsx';

class OutfitGenerator extends Component {
	constructor() {
		super();
		this.state = {
			outfit: {},
			loading: false
		}
	}

	generateOutfit = async () => {
		const { user } = this.props;

		await this.setState({ loading: true });

		const outfit = await callAPI('outfits/today', null, user.token);
		this.setState({ outfit, loading: false });
	}

	handleSelect = () => {
		const { user } = this.props;
		const { outfit } = this.state;

		const newDate = new Date();

		if (outfit.outerwear && outfit.outerwear.length) {
			for (const outerwear of outfit.outerwear) {
				const endpoint = `outerwears/${outerwear.id}`;
				callAPI(endpoint, null, user.token, 'PUT', {
					outerwear: {
						...outerwear,
						lastWorn: newDate
					}
				});
			}
		}

		if (outfit.shirt) {
			const endpoint = `shirts/${outfit.shirt.id}`;
			callAPI(endpoint, null, user.token, 'PUT', {
				shirt: {
					...outfit.shirt,
					lastWorn: newDate
				}
			});
		}

		if (outfit.pants) {
			const endpoint = `pants/${outfit.pants.id}`;
			callAPI(endpoint, null, user.token, 'PUT', {
				pants: {
					...outfit.pants,
					lastWorn: newDate
				}
			});
		}

		if (outfit.dress) {
			const endpoint = `dresses/${outfit.dress.id}`;
			callAPI(endpoint, null, user.token, 'PUT', {
				dress: {
					...outfit.dress,
					lastWorn: newDate
				}
			});
		}
	}

	render() {
		const { disabled, history } = this.props;
		const { outfit, loading } = this.state;

		let outfitDisplay;

		if (loading) {
			outfitDisplay = <p>Loading...</p>;
		} else {
			outfitDisplay = [];
			if (outfit.outerwear && outfit.outerwear.length) {
				outfitDisplay.push(<h3 key={ `outerwear-${Math.random()}` }>Outerwear</h3>);
				outfitDisplay.push(...outfit.outerwear.map(e => {
					return <SimpleArticle key={ e.id } data={ e } history={ history }/>;
				}));
			}

			if (outfit.shirt) {
				outfitDisplay.push(<h3 key='shirt'>Shirt</h3>);
				outfitDisplay.push(<SimpleArticle key={ `shirt-${outfit.shirt.id}` } data={ outfit.shirt } history={ history }/>);
			}
			if (outfit.pants) {
				outfitDisplay.push(<h3 key='pants'>Pants</h3>);
				outfitDisplay.push(<SimpleArticle key={ `pants-${outfit.pants.id}` } data={ outfit.pants } history={ history }/>);
			}

			if (outfit.dress) {
				outfitDisplay.push(<h3 key='dress'>Dress</h3>);
				outfitDisplay.push(<SimpleArticle key={ `dress-${outfit.dress.id}` } data={ outfit.dress } history={ history }/>);
			}

			if (outfit.shirt || outfit.pants)
				outfitDisplay.push(<button key='wear-button' onClick={ this.handleSelect }>Wear</button>)
		}

		return (
			<div>
				<h2>Outfit</h2>
				{  outfitDisplay  }
				<button disabled={ disabled } onClick={ this.generateOutfit }>Generate Outfit</button>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		user: state.user
	}
}

export default withRouter(connect(mapStateToProps)(OutfitGenerator));
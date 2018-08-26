import React from 'react';
import SmallArticle from '../../Components/SmallArticle';

export default props => {
	const { fieldName, label, addedArticles, searchInput, suggestedArticles, addArticle, removeArticle } = props;

	const addedArticleComponents = addedArticles.map(e => {
		return <SmallArticle key={ e.id }
					clickIcon='&times;'
					name={ e.name }
					imageUrl={ e.imageUrl }
					onClick={ () => removeArticle(fieldName, e.id) }
				/>
	});

	const suggestedArticleComponents = suggestedArticles.map(e => {
		return <SmallArticle key={ e.id }
					clickIcon='+'
					name={ e.name }
					imageUrl={ e.imageUrl }
					onClick={ () => addArticle(fieldName, e.id) }
				/>
	});

	return (
		<div className='input-container'>
			{ label }
			
			{ !!addedArticleComponents.length && (
				<div className='input-container'>
					<label className='sublabel'>Joined</label>
					<div className='small-articles-container'>
						{ addedArticleComponents }
					</div>
				</div>
			)}

			{ searchInput }

			{ !!suggestedArticleComponents.length && (
				<div className='input-container'>
					<label className='sublabel'>Suggestions</label>
					<div className='small-articles-container'>
						{ suggestedArticleComponents }
					</div>
				</div>
			)}
		</div>
	)
}
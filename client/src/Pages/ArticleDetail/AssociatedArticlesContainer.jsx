import React from 'react';
import SmallArticle from '../../Components/SmallArticle';

export default props => {
	const { articles, modelName, handleClick } = props;

	const articleItems = articles.map(e => {
		return <SmallArticle key={ e.id } name={ e.name } imageUrl={ e.imageUrl } onClick={ () => handleClick(modelName, e.id) }/>;
	})
	
	return (
		<div className='associated-articles-container'>
			{ articleItems }
		</div>
	)
}
import React from 'react';

const SelectColor = ( { namespace, style, className = '' } ) => {
	return (
		<span className={ `${ namespace }-preset-container${ className }` }>
			<span className={ `${ namespace }-preset-inner` }>
				<span className={ `${ namespace }-preset-back` }>
					<span 
						className={ `${ namespace }-preset` } 
						style={ style }
					></span>
					<span className={ `${ namespace }-shade` }></span>
				</span>
			</span>
		</span>
	);
};

export default SelectColor;
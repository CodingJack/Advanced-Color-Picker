import React from 'react';

import {
	AppContext,
} from '../../context';

const {
	memo,
	useContext,
} = React;

const RangeSlider = ( { 
	min, 
	max, 
	value, 
	disabled, 
	onMouseDown, 
	onMouseUp, 
	onChange, 
	step = 0.5, 
} ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;

	return (
		<span className={ `${ namespace }-slider-wrap` }>
			<span className={ `${ namespace }-slider-track` }></span>
			<input 
				className={ `${ namespace }-slider` }
				type="range" 
				min={ min }
				max={ max }
				step={ step }
				value={ value } 
				disabled={ disabled }
				onMouseDown={ onMouseDown }
				onMouseUp={ onMouseUp }
				onChange={ onChange } 
			/>
		</span>
	);
};

export default memo( RangeSlider );

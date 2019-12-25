import React from 'react';

import {
	AppContext,
} from '../../context';

const {
	memo,
	forwardRef,
	useContext,
} = React;

/*
 * @desc represents a row of controls which may or may not have additional classes or events
 * @since 1.0.0
*/
const Row = forwardRef( ( { className, onMouseEnter, onMouseLeave, children }, ref ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	const extraClass = ! className ? '' : ` ${ className }`;
	
	return (
		<div 
			className={ `${ namespace }-row${ extraClass }` }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
			ref={ ref }
		>{ children }</div>
	);
} );

export default memo( Row );
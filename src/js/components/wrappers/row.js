import React from 'react';

import {
	AppContext,
} from '../../context';

const {
	memo,
	forwardRef,
	useContext,
} = React;

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
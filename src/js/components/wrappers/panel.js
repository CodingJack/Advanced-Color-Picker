import React from 'react';

const {
	memo,
	useContext,
} = React;

import {
	AppContext,
} from '../../context';

/*
 * @desc represents a controls panel which may or may not have an additional class name
 * @since 1.0.0
*/
const Panel = ( { className, children } ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	const extraClass = ! className ? '' : ` ${ className }`;
	
	return (
		<div className={ `${ namespace }-panel${ extraClass }` }>{ children }</div>
	);
};

export default memo( Panel );
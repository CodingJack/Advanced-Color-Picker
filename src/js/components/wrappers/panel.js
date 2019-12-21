import React from 'react';

const {
	memo,
	useContext,
} = React;

import {
	AppContext,
} from '../../context';

const Panel = ( { className, children } ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	const extraClass = ! className ? '' : ` ${ className }`;
	
	return (
		<div className={ `${ namespace }-panel${ extraClass }` }>{ children }</div>
	);
};

export default memo( Panel );
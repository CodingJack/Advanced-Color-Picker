import React from 'react';

const {
	memo,
	useContext,
} = React;

import {
	AppContext,
} from '../../context';

const InputWrap = ( { className, children } ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	const extraClass = ! className ? '' : ` ${ className }`;
	
	return (
		<span className={ `${ namespace }-input-wrap${ extraClass }` }>{ children }</span>
	);
};

export default memo( InputWrap );
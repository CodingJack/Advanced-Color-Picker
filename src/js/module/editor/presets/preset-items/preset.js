import React from 'react';

import {
	AppContext,
} from '../../../../context';

const {
	memo,
	forwardRef,
	useContext,
} = React;

const Preset = forwardRef( ( { preset, className, style, type, setColorByRecord }, ref) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	
	let presetClass = className.replace( /\s\s+/g, ' ' );
	if ( presetClass === ' ' ) {
		presetClass = '';
	}
	
	return (
		<span 
			ref={ ref }
			className={ `${ namespace }-preset-container${ presetClass }` } 
			onClick={ () => setColorByRecord( preset, type ) }
		>
			<span className={ `${ namespace }-preset-inner` }>
				<span className={ `${ namespace }-preset-back` }>
					<span className={ `${ namespace }-preset` } style={ style }></span>
					<span className={ `${ namespace }-preset-shade` }></span>
				</span>
			</span>
		</span>
	);
} );

export default memo( Preset );
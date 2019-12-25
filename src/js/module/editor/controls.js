import React from 'react';
import ColorControls from './controls/color-controls';
import GradientControls from './controls/gradient-controls';

import {
	AppContext,
} from '../../context';

const {
	memo,
	useContext,
} = React;

/*
 * @desc the main wrapper for the core controls which includes the color (plus palette) and gradient controls
 * @since 1.0.0
*/
const Controls = ( { className } ) => {
	const appContext = useContext( AppContext );
	const { namespace, colorMode } = appContext;
	
	return (
		<div className={ `${ namespace }-controls${ className }` }>
			<div className={ `${ namespace }-controls-inner` }>
				<ColorControls />
				{ colorMode !== 'single' && <GradientControls /> }
			</div>
		</div>
	);
};

export default memo( Controls );
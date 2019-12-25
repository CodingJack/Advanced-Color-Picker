import React from 'react';
import Presets from '../../presets';

import {
	AppContext,
} from '../../../../context';

const {
	memo,
	useContext,
} = React;

/*
 * @desc displays a presets panel when the editor is in "single" mode (colors only, no gradients)
 * @since 1.0.0
*/
const ColorPresets = () => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
	
	return (
		<div className={ `${ namespace }-presets ${ namespace }-preset-colors` }>
			<Presets isSingle type="color" columns={ 5 } minRows={ 5 } />
		</div>
	);
};

export default memo( ColorPresets );
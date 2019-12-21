import React from 'react';
import Button from '../../../../components/buttons/button';

const {
	memo,
} = React;

const DeletePreset = ( { index, type, disabled, callback } ) => {
	const onDelete = () => {
		const view = type.charAt(0).toUpperCase() + type.slice(1);
		if ( window.confirm( `Delete this Saved ${ view }?` ) ) {
			callback( type, index );
		}
	}
	
	return (
		<Button
			disabled
			type="long"
			label="Delete Preset"
			onClick={ onDelete }
			disabled={ disabled }
		>
		</Button>
	);
};

export default memo( DeletePreset );
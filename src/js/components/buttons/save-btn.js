import React from 'react';
import Button from './button';

import {
	EditorContext,
} from '../../context';

const {
	useState,
	useEffect,
	useContext,
} = React;

/*
 * @desc used for the "save preset" buttons 
 * @since 1.0.0
*/
const SaveBtn = ( { 
	type, 
	label, 
	group,
	onSave,
	className,	
	currentOutput, 
	disabled: isDisabled,
} ) => {
	const editorContext = useContext( EditorContext );
	const { presets: editorPresets } = editorContext;
	const extraClass = ! className ? '' : ` ${ className }`;
	
	const [
		saveIcon,
		updateSaveIcon,
	] = useState( 'save' );
	
	const onClick = () => {
		updateSaveIcon( 'check' );
		onSave();
	};
	
	const resetIcon = () => {
		updateSaveIcon( 'save' );
	};
	
	// changes the icon to a "check" when clicked and then changes it back to a "save disk" shortly afterward
	useEffect( () => {
		let timer;
		if ( saveIcon === 'check' ) {
			timer = setTimeout( resetIcon, 500 );
		}
		return () => {
			clearTimeout( timer );
		}
	}, [ saveIcon ] );
	
	// ensures that saving can only be done if the preset doesn't already exist
	let disabled;
	if ( ! isDisabled ) {
		const curOutput = currentOutput.toLowerCase();
		const presets = editorPresets[ group ];
		const { defaults, custom } = presets;
		const presetItms = [].concat( defaults ).concat( custom );
		const { length: presetLength } = presetItms;
		
		for ( let i = 0; i < presetLength; i++ ) {
			const preset = presetItms[i];
			const { output: presetOutput } = preset;
			if ( presetOutput.toLowerCase() === curOutput ) {
				disabled = true;
				break;
			}
		}
	} else {
		disabled = true;
	}
	
	return (
		<Button 
			type={ type }
			label={ label }
			icon={ saveIcon }
			disabled={ disabled }
			className={ extraClass }
			onClick={ onClick }
		/>
	);
};

export default SaveBtn;
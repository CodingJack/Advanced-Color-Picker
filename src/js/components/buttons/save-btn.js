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
	
	useEffect( () => {
		let timer;
		if ( saveIcon === 'check' ) {
			timer = setTimeout( resetIcon, 500 );
		}
		return () => {
			clearTimeout( timer );
		}
	}, [ saveIcon ] );
	
	let disabled;
	if ( ! isDisabled ) {
		let presets = editorPresets[ group ];
		const { defaults, custom } = presets;
		
		const presetItms = [].concat( defaults ).concat( custom );
		const { length: presetLength } = presetItms;
		
		for ( let i = 0; i < presetLength; i++ ) {
			const preset = presetItms[i];
			const { output } = preset;
			if ( output.toLowerCase() === currentOutput.toLowerCase() ) {
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
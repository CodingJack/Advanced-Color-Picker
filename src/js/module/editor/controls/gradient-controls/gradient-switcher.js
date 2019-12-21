import React from 'react';
import SelectBox from '../../../../components/select-box';
import SaveBtn from '../../../../components/buttons/save-btn';
import Button from '../../../../components/buttons/button';

import {
	AppContext,
	EditorContext,
} from '../../../../context';

const {
	useContext,
} = React;

const GradientSwitcher = () => {
	const appContext = useContext( AppContext );
	const editorContext = useContext( EditorContext );
	
	const { 
		onSavePreset,
		onAddGradient, 
		onSwapGradient, 
		onDeleteGradient,
		onSwitchGradient,
		currentPreview,
		currentOutput,
		selectedGradient,
		value: editorValue,
	} = editorContext;
	
	const list = {};
	const { length: editorLength } = editorValue;
	const { namespace } = appContext;
	
	let i = editorLength;
	let currentLabel;
	let count = 0;
	
	while( i-- ) {
		list[i] = {
			index: i + 1,
			label: `Gradient #${ i + 1 }`,
			preview: editorValue[ count++ ],
		};
	}
	
	const currentIndex = Math.abs( selectedGradient - ( editorLength - 1 ) );
	if ( editorLength > 1 ) {
		const selectedItm = list[ currentIndex ];
		const { index } = selectedItm;
		currentLabel = `Gradient ${ index }/${ editorLength }`;
	}
	
	return (
		<>
			<SelectBox
				preview
				reverse
				prop="gradient-switch"
				list={ list }
				value={ currentIndex }
				currentLabel={ currentLabel }
				onChange={ onSwitchGradient }
				onSwapItem={ onSwapGradient }
				currentPreview={ currentPreview }
				className={ `${ namespace }-select-gradient` }
			/>
			<Button 
				type="small" 
				icon="library_add" 
				onClick={ onAddGradient }  
			/>
			<SaveBtn 
				type="small"
				group="gradient"
				currentOutput={ currentOutput }
				onSave={ () => onSavePreset( 'gradient' ) } 
			/>
			<Button 
				type="small" 
				icon="delete_sweep" 
				disabled={ editorLength < 2 }
				onClick={ onDeleteGradient } 
				className={ `${ namespace }-gradient-delete` }
			/>
		</>
	);
};

export default GradientSwitcher;

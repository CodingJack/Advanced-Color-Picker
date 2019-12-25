import React from 'react';
import SaveBtn from '../../../../components/buttons/save-btn';
import CopyBtn from '../../../../components/buttons/copy-btn';
import Button from '../../../../components/buttons/button';
import Row from '../../../../components/wrappers/row';

import {
	AppContext,
} from '../../../../context';

const {
	memo,
	useContext,
} = React;

/*
 * @desc the action buttons placed below the palette:
 *       1. save preset
 *       2. set color to transparent
 *       3. add new color to gradient
 *       4. delete currently selected color from gradient
 * @since 1.0.0
*/
const ColorButtons = ( { 
	onChange, 
	colorMode,
	canDelete,
	onAddColor, 
	onSavePreset, 
	onDeleteColor,
	opacityActive,
	addColorClass,
	currentOutput,
} ) => {
	const locale = useContext( AppContext );
	const { namespace } = locale;
		
	return (
		<Row className={ `${ namespace }-left-column-buttons` }>
			<SaveBtn 
				type="medium"
				group="color"
				disabled={ opacityActive }
				currentOutput={ currentOutput }
				onSave={ () => onSavePreset( 'color' ) } 
			/>
			{ colorMode === 'single' && (
				<CopyBtn 
					type="medium" 
					value={ ! opacityActive ? currentOutput : 'transparent' } 
				/>
			) }
			<Button 
				type="medium"
				icon="invert_colors_off"
				active={ opacityActive }
				activeState={ opacityActive }
				onClick={ () => onChange( null, 'clear' ) }
			/>
			{ colorMode !== 'single' && (
				<>
					<Button 
						type="medium"
						icon="add_box"
						className={ addColorClass }
						onClick={ onAddColor }
					/>
					<Button 
						type="medium"
						icon="delete_sweep"
						onClick={ onDeleteColor }
						disabled={ ! canDelete }
					/>
				</>
			) }
		</Row>
	);
}

export default memo( ColorButtons );
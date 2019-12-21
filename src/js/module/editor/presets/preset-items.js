import React from 'react';
import Preset from './preset-items/preset';
import DeletePreset from './preset-items/delete-preset';
import Wrapper from '../../../components/wrappers/wrapper';
import Scrollable from '../../../hoc/scrollable';

import {
	AppContext,
	EditorContext,
} from '../../../context';

const {
	useContext,
} = React;

const PresetItems = ( { type, menu, columns, minRows } ) => {
	const appContext = useContext( AppContext );
	const editorContext = useContext( EditorContext );
	
	const {
		output,
		presets,
		currentColor,
		currentOutput,
		onDeletePreset,
		setColorByRecord,
		value: editorValue,
	} = editorContext;
	
	const colorValue = type === 'color' ? currentColor : editorValue;
	const { color, opacity } = colorValue;
	let { hex: editorHex } = colorValue;
	let editorOutput;
	
	if ( color ) {
		if ( opacity > 0 ) {
			editorOutput = color.toLowerCase();
		} else {
			editorOutput = 'transparent';
			editorHex = '';
		}
	} else {
		editorOutput = output.toLowerCase();
	}
	
	const items = presets[ type ][ menu ];
	const numRows = items.length ? Math.ceil( items.length / columns ) : minRows;
	const rows = new Array( numRows ).fill( 0 );
	
	while( rows.length < minRows ) {
		rows.push( 0 );
	}
	
	const { length: rowLength } = rows;
	const lastRow = rowLength - 1;
	
	const { namespace, colorMode } = appContext;
	const customClass = menu === 'defaults' ? '' : ` ${ namespace }-presets-custom`;
	const hasDeleteBtn = menu === 'custom' || colorMode === 'single';
	const isSingleDefault = menu === 'defaults' && colorMode === 'single';
	
	let showDeleteBtn;
	let presetIndex = 0;
	let deleteIndex;
		
	return (
		<>
			<div className={ `${ namespace }-presets-container${ customClass }` }>
				<Wrapper
					wrapIt={ rowLength > minRows }
					wrapper={ children => <Scrollable>{ children }</Scrollable> }
				>
				{
					rows.map( ( itm, row ) => {
						const className = row < lastRow ? '' : `${ namespace }-preset-row-last`;
						const point = row * columns;
						const presets = items.slice( point, point + columns );
						
						const presetItems = presets.map( preset => { 
							return { preset, extraClass: '' };
						} );
						
						const extraClass = ` ${ namespace }-preset-blank`;
						while( presetItems.length < columns ) {
							presetItems.push( { extraClass } );
						}
						
						return presetItems.map( ( itm, index ) => {
							const { preset, extraClass: blankClass } = itm;
							
							let { 
								hex, 
								output,
								preview,
								gradient,
							} = preset || {};
							
							if ( hex ) {
								hex = hex.toLowerCase();
							}
							if ( output ) {
								output = output.toLowerCase();
							}
							
							let active;
							if ( ! blankClass ) {
								if ( ! gradient ) {
									active = output === editorOutput || 
											 hex === editorOutput || 
											 hex === editorHex.toLowerCase();
								} else {
									active = output === editorOutput || 
											 output === currentOutput.toLowerCase();
								}
							}
							
							if ( active && ! showDeleteBtn && menu === 'custom' ) {
								showDeleteBtn = true;
								deleteIndex = presetIndex;
							}
							
							const mainClass = `${ className }${ blankClass }`;
							const extraClass = ! mainClass ? '' : ` ${ mainClass }`; 
							const activeClass = ! active ? '' : ` ${ namespace }-preset-active`;
							presetIndex++;
							
							return (
								<Preset
									key={ `${ namespace }-preset-${ ( row + 1 ) * ( index + 1 ) }` } 
									className={ ` ${ activeClass }${ extraClass }` } 
									type={ type }
									style={ preview }
									preset={ preset }
									setColorByRecord={ setColorByRecord }
								/>
							);
						} )
					} )
				}
				</Wrapper>
			</div>
			{ hasDeleteBtn && (
				<DeletePreset
					type={ type }
					group={ items }
					index={ deleteIndex }
					callback={ onDeletePreset }
					disabled={ ! showDeleteBtn || isSingleDefault }
				/>
			) }
		</>
	);
}

export default PresetItems;
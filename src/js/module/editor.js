/*
 * the main entry point for all controls
*/

import React from 'react';
import arrayMove from 'array-move';
import Container from './container';
import SidePanels from './editor/sidepanels';
import Header from './editor/header';
import Controls from './editor/controls';
import Footer from './editor/footer';
import getColorData from '../utils/data';
import initPresets from '../utils/presets';

import {
	AppContext,
	EditorContext,
} from '../context';

import {
	updateDefaults,
	defaultSettings,
} from '../settings';

import {
	defaultEditorGradient,
} from '../data/defaults';

import {
	coreColors,
	coreGradients,
} from '../data/presets';

import {
	deepClone,
	writeHintData,
	getNextPosition,
	reversePositions,
} from '../utils/editor';

import {
	cssGradient,
	buildGradientStrip,
} from '../utils/output';

import {
	sortByPosition,
	writeGradientColor,
} from '../utils/gradients';

import {
	convertPositionUnit,
} from '../utils/utilities';

const {
	Component,
	createRef,
} = React;

/*
 * @desc collects default state values for the editor class based on initial data or preset data
 * @returns object
 * @since 1.0.0
*/
const getEditorValues = ( data, index, fromRecord ) => {
	const { output, value } = data;	
	const currentGradient = value[ index ];
	const { colors, hints } = currentGradient;
	
	const values = {
		hints,
		colors,
		output,
		currentGradient,
		activeHint: -1,
		selectedColor: 0,
		currentColor: colors[0],
		selectedGradient: index,
	};
	
	if ( ! fromRecord ) {
		let currentOutput;
		if ( value.length < 2 ) {
			currentOutput = output;
		} else {
			currentOutput = cssGradient( [ currentGradient ] );
		}
		values.currentPreview = { background: currentOutput };
		values.currentOutput = currentOutput;
	}
	
	return values;
};

/*
 * @desc the top-level class for all controls
 * @since 1.0.0
*/
class Editor extends Component {
	constructor() {
		super( ...arguments );
		
		const { allowConic } = this.context;
		const { value: userValue } = this.props;
		
		const colorData = getColorData( userValue, allowConic );
		const { value: gradients } = colorData;
		
		const { length: gradientLength } = gradients;
		const gradIndex = gradientLength - 1;
		
		const gradient = gradients[ gradIndex ];
		const { colors } = gradient;
		const { length: colorLength } = colors;
		
		const { 
			colorPresets,
			gradientPresets,
		} = defaultSettings;
		
		if ( ! colorPresets ) {
			updateDefaults( { colorPresets: coreColors } );
		}
		if ( ! gradientPresets ) {
			updateDefaults( { gradientPresets: coreGradients } );
		}
		
		// functions are stored in "state" as the state is used for the context provider value
		this.state = {
			editorUpdate: false,
			positionChange: false,
			colorPresetMenu: 'defaults',
			gradPresetMenu: 'defaults',
			containerRef: createRef(),
			onAddColor: this.onAddColor,
			toggleMode: this.toggleMode,
			onSwapColor: this.onSwapColor,
			onSavePreset: this.onSavePreset,
			showHideHint: this.showHideHint,
			onChangeColor: this.onChangeColor,
			onDeleteColor: this.onDeleteColor,
			onAddGradient: this.onAddGradient,
			onSwapGradient: this.onSwapGradient,
			onDeletePreset: this.onDeletePreset,
			onActivateColor: this.onActivateColor,
			showHidePreview: this.showHidePreview,
			onClearGradient: this.onClearGradient,
			setColorByRecord: this.setColorByRecord,
			onDeleteGradient: this.onDeleteGradient,
			onSwitchGradient: this.onSwitchGradient,
			onChangeGradient: this.onChangeGradient,
			onChangePosition: this.onChangePosition,
			onChangeColorUnit: this.onChangeColorUnit,
			onReverseGradient: this.onReverseGradient,
			onChangePresetMenu: this.onChangePresetMenu,
			onChangeHintPercentage: this.onChangeHintPercentage,
			currentMode: colorLength === 1 ? 'color' : 'gradient',
			presets: initPresets( coreColors, coreGradients, allowConic ),
			...getEditorValues( colorData, gradIndex ),
			...colorData,
		};
	}
	
	/*
	 * @desc "currentOutput" and "currentPreview" are always the currently selected gradient's output
	 * @returns object
	 * @since 1.0.0
	*/
	getCurrentOutput = ( output, length, currentGradient ) => {
		if ( length < 2 ) {
			return {
				currentOutput: output,
				currentPreview: { background: output },
			};
		}
		const currentOutput = cssGradient( [ currentGradient ] );
		return {
			currentOutput,
			currentPreview: { background: currentOutput },
		};
	};
	
	/*
	 * @desc "mode" is changed from the small buttons in the preview,
	 *       allowing the user to swap between a single color, a single gradient or all gradients (if stacked)
	 *       this also effectively changes the final output value, as the output is always based on the selected "mode"
	 * @param string currentMode - the newly selected mode to change to
	 * @since 1.0.0
	*/
	toggleMode = currentMode => {
		let output;
		
		this.setState( prevState => {
			const { 
				hints,
				colors,
				selectedColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
				currentColor: prevColor,
			} = prevState;
			
			let currentColor = prevColor;
			let positionChange = false;
			let editorUpdate = false;
			
			if ( currentMode !== 'color' ) {
				const { length: colorLength } = colors;
				if ( colorLength < 2 ) {
					const { value: color } = prevColor;
					currentColor = writeGradientColor( color, 100 );
					hints.push( { percentage: 50 } );
					colors.push( currentColor );
					sortByPosition( colors, true );
					writeHintData( colors, hints, true );
					positionChange = true;
					editorUpdate = true;
				}
			}
			
			output = cssGradient( 
				editorValue, 
				currentMode, 
				selectedColor,
				selectedGradient
			);
			
			return {
				output,
				currentMode,
				currentColor,
				editorUpdate,
				positionChange,
				preview: { background: output },
				selectedColor: colors.indexOf( currentColor ),
				strip: { background: buildGradientStrip( 
					colors, 
					hints, 
					currentMode, 
					selectedColor 
				) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc adds a new gradient to the current stack
	 *       the newly added gradient will have 2 default colors of black/white
	 * @since 1.0.0
	*/
	onAddGradient = () => {
		let output;
		
		this.setState( prevState => {
			const { 
				currentMode, 
				selectedColor,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			const newGradient = defaultEditorGradient();
			const { colors, hints } = newGradient;
			
			editorValue.unshift( newGradient );
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return {
				...getEditorValues( prevState, 0 ),
				output,
				editorUpdate: true,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc reverses the positioning of all colors in the currently selected gradient
	 * @since 1.0.0
	*/
	onReverseGradient = () => {
		let output;
		
		this.setState( prevState => {
			const { 
				hints,
				colors,
				currentMode,
				currentColor,
				selectedColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			colors.reverse().forEach( reversePositions );
			hints.reverse().forEach( reversePositions );
			writeHintData( colors, hints );
			
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return {
				output,
				editorUpdate: false,
				positionChange: true,
				preview: { background: output },
				selectedColor: colors.indexOf( currentColor ),
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			}
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
		
	};
	
	/*
	 * @desc deletes a stacked gradient from the master list
	 * @since 1.0.0
	*/
	onDeleteGradient = () => {
		let output;
		
		this.setState( prevState => {
			const { 
				selectedColor,
				currentMode: mode,
				value: editorValue,
				selectedGradient: index,
			} = prevState;
			
			editorValue.splice( index, 1 );
			const { length: editorLength } = editorValue;
			const currentMode = editorLength === 1 ? 'gradient' : mode;
			const nextIndex = Math.max( 0, index - 1 );
			const { colors, hints } = editorValue[ nextIndex ];
			
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				nextIndex,
			);
			
			return {
				...getEditorValues( prevState, nextIndex, true ),
				output,
				currentMode,
				editorUpdate: true,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorLength,
					editorValue[ nextIndex ],
				),
			}
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc deletes a stacked gradient from the master list
	 * @since 1.0.0
	*/
	onChangeGradient = ( opt, value ) => {
		let output;
		
		this.setState( prevState => {
			const { 
				hints,
				colors,
				currentMode,
				selectedColor,
				selectedGradient,
				currentGradient,
				value: editorValue,
			} = prevState;
			
			currentGradient[ opt ] = value;
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
		
			return {
				output,
				editorUpdate: false,
				positionChange: false,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc switches the editor between currently stacked gradients
	 * @param number index - the index of the newly selected gradient
	 * @since 1.0.0
	*/
	onSwitchGradient = index => {
		this.setState( prevState => {
			const {
				currentMode,
				selectedColor,
				value: editorValue,
			} = prevState;
			
			const editorValues = getEditorValues( prevState, index );
			const { colors, hints } = editorValues;
			const output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				index,
			);
			
			return {
				...editorValues,
				editorUpdate: true,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
			}
		} );
	};
	
	/*
	 * @desc swap stacked gradients between each other
	 * @param number oldIndex - the previous index of the swapped gradient
	 * @param number newIndex - the new index of the swapped gradient
	 * @since 1.0.0
	*/
	onSwapGradient = ( oldIndex, newIndex ) => {
		let output;
		
		this.setState( prevState => {
			const { 
				currentMode,
				currentGradient,
				selectedColor,
				value: editorValue,
			} = prevState;
			
			arrayMove.mutate( editorValue, oldIndex, newIndex );
			const selectedGradient = editorValue.indexOf( currentGradient );
			
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return {
				output,
				selectedGradient,
				editorUpdate: false,
				positionChange: false,
				preview: { background: output },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc clear out all stacked gradients leaving only the currently selected gradient
	 * @since 1.0.0
	*/
	onClearGradient = () => {
		let output;
		
		this.setState( prevState => {
			const { 
				selectedColor,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			const currentMode = 'gradient';
			const value = [ editorValue[ selectedGradient ] ];
			output = cssGradient( value, currentMode, selectedColor );
			
			return {
				value,
				output,
				currentMode,
				selectedGradient: 0,
				editorUpdate: false,
				positionChange: false,
				preview: { background: output },
				...this.getCurrentOutput( output, 1 ),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc show or hide the hint percentage in the preview strip
	 * @param number index - the index of the hint to show/hide
	 * @since 1.0.0
	*/
	showHideHint = index => {
		this.setState( {
			activeHint: index,
			editorUpdate: false,
			positionChange: false,
		} );
	};
	
	/*
	 * @desc activates/deactivates the large preview
	 * @param previewActive boolean - if the preview should be shown or hidden
	 * @since 1.0.0
	*/
	showHidePreview = previewActive => {
		this.setState( prevState => {
			const { containerRef } = prevState;
			const { current: container } = containerRef;
			if ( previewActive ) {
				container.style.opacity = 0;
				container.style.visibility = 'hidden';
			} else {
				container.style.opacity = null;
				container.style.visibility = null;
			}
			return { 
				previewActive,
				editorUpdate: false,
				positionChange: false,
			};
		} );
	};
	
	/*
	 * @desc changes the position of any given hint
	 * @param number value - the new percentage for the hint
	 * @param number index  - the index of the hint to change
	 * @since 1.0.0
	*/
	onChangeHintPercentage = ( value, index ) => {
		let output;
		
		this.setState( prevState => {
			const { 
				hints,
				colors,
				currentMode,
				selectedColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			hints[ index ].percentage = value;
			writeHintData( colors, hints, true );
			
			output = output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return { 
				output,
				editorUpdate: false,
				positionChange: false,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc changes the position stop of a color 
	 * @param number position - the new percentage for the hint
	 * @param boolean update - whether or not the controls should update themselves or not 
	 *                         depending on where the change is coming from
	 * @since 1.0.0
	*/
	onChangePosition = ( position, update ) => {
		let output;
		
		this.setState( prevState => {
			const {
				hints,
				colors,
				currentMode,
				currentColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
				selectedColor: prevSelectedColor,
			} = prevState;
			
			currentColor.position = position;
			sortByPosition( colors, true );
			
			const selectedColor = colors.indexOf( currentColor );
			const { length: colorLength } = colors;
			const len = colorLength - 1;
			
			if ( len > 0 ) {
				const prevHintIndex = prevSelectedColor < len ? prevSelectedColor : len - 1;
				const adjacentHint = hints[ prevHintIndex ];
				const newHintIndex = selectedColor < len ? selectedColor : len - 1;
				
				hints.splice( hints.indexOf( adjacentHint ), 1 );
				hints.splice( newHintIndex, 0, adjacentHint );
				writeHintData( colors, hints, true );
			}
			
			output = cssGradient( 
				editorValue, 
				currentMode, 
				selectedColor,
				selectedGradient, 				
			);
			
			return {
				output,
				selectedColor,
				editorUpdate: false,
				positionChange: ! update,
				preview: { background: output },
				strip: { background: buildGradientStrip( 
					colors, 
					hints, 
					currentMode, 
					selectedColor 
				) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc activates any given color in the gradient for further editing
	 * @param number index - the index of the activated color
	 * @since 1.0.0
	*/
	onActivateColor = index => {
		this.setState( prevState => {
			const { colors, currentMode } = prevState;
			
			const newState = {
				editorUpdate: true,
				positionChange: true,
				selectedColor: index,
				currentColor: colors[ index ],
			};
			
			if ( currentMode === 'color' ) {
				const { color } = colors[ index ];
				newState.currentOutput = color;
				newState.strip = { background: color };
				newState.preview = { background: color };
				newState.currentPreview = { background: color };
			}
			
			return newState;
		} );
	};
	
	/*
	 * @desc adds a new color to the gradient (will inherit the same color as the previously selected one)
	 * @param number pos - the possible position of the newly added color (if the strip was clicked)
	 * @since 1.0.0
	*/
	onAddColor = pos => {
		let output;
		
		this.setState( prevState => {
			const {
				hints,
				colors,
				currentGradient,
				selectedGradient,
				value: editorValue,
				currentMode: mode,
				currentColor: prevColor,
				selectedColor: curSelectedColor,
			} = prevState;
			
			const { value } = prevColor;
			const position = ! isNaN( pos ) ? pos : getNextPosition( colors, curSelectedColor );
			const newColor = writeGradientColor( value, position );
			const currentMode = mode === 'color' ? 'gradient' : mode;
			
			hints.push( { percentage: 50 } );
			colors.push( newColor );
			sortByPosition( colors, true );
			writeHintData( colors, hints, true );
			const selectedColor = colors.indexOf( newColor );
			
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return {
				output,
				currentMode,
				selectedColor,
				editorUpdate: false,
				positionChange: true,
				currentColor: newColor,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc deletes the currently selected color from the currently selected gradient
	 * @since 1.0.0
	*/
	onDeleteColor = () => {
		let output;
		
		this.setState( prevState => {
			const {
				hints,
				colors,
				currentGradient,
				selectedGradient,
				currentMode: mode,
				value: editorValue,
				selectedColor: prevSelectedColor,
			} = prevState;

			const { length } = colors;
			if ( prevSelectedColor < length - 1 ) {
				hints.splice( prevSelectedColor, 1 );
			} else {
				hints.pop();
			}

			colors.splice( prevSelectedColor, 1 );
			const selectedColor = Math.max( 0, prevSelectedColor - 1 );
			const currentColor = colors[ selectedColor ];
			const currentMode = colors.length === 1 ? 'color' : mode;
			
			writeHintData( colors, hints, true );
			output = cssGradient( 
				editorValue, 
				currentMode, 
				selectedColor,
				selectedGradient, 
			);
		
			return {
				output,
				currentMode,
				currentColor,
				selectedColor,
				editorUpdate: true,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( 
					colors, 
					hints, 
					currentMode, 
					selectedColor 
				) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc changes the value of the currently selected color
	 * @param array color - the rgba values of the currently selected color
	 * @param boolean editorUpdate - whether or not the controls should update themselves 
	 *                               depending on where the change cam from
	 * @since 1.0.0
	*/
	onChangeColor = ( color, editorUpdate = false ) => {
		let output;
		
		this.setState( prevState => {
			const {
				hints,
				colors,
				currentMode,
				currentColor,
				selectedColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			const { position, unit } = currentColor;
			const newColor = writeGradientColor( color, position, unit );
			
			colors[ selectedColor ] = newColor;
			output = cssGradient( 
				editorValue, 
				currentMode, 
				selectedColor,
				selectedGradient, 
			);
		
			return {
				output,
				editorUpdate,
				positionChange: false,
				currentColor: newColor,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints, currentMode ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc swaps a colors index in the gradient, 
	 *       inherting the position from the color its being swapped with (and vice versa)
	 * @param number oldIndex - the previous index of the color being swapped
	 * @param number newIndex - the new index of the color being swapped
	 *                          depending on where the change cam from
	 * @since 1.0.0
	*/
	onSwapColor = ( oldIndex, newIndex ) => {
		let output;
		
		this.setState( prevState => {
			const { 
				currentMode,
				currentColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			const { colors, hints } = currentGradient;
			const prevColor = colors[ oldIndex ];
			const nextColor = colors[ newIndex ];
			const { position: prevPos, unit: prevUnit } = prevColor;
			const { position: nextPos, unit: nextUnit } = nextColor;
			
			prevColor.position = nextPos;
			nextColor.position = prevPos;
			prevColor.unit = nextUnit;
			nextColor.unit = prevUnit;
			
			arrayMove.mutate( colors, oldIndex, newIndex );
			const selectedColor = colors.indexOf( currentColor );
			
			output = cssGradient(
				editorValue, 
				currentMode,
				selectedColor,
				selectedGradient,
			);
			
			return {
				output,
				selectedColor,
				editorUpdate: false,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints, currentMode ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc changes a color's unit from "%" to "px" or vice versa
	 * @param string unit - the new unit to change to
	 * @since 1.0.0
	*/
	onChangeColorUnit = unit => {
		let output;
		
		this.setState( prevState => {
			const { 
				hints,
				colors,
				currentMode,
				currentColor, 
				selectedColor,
				currentGradient,
				selectedGradient,
				value: editorValue,
			} = prevState;
			
			const { position } = currentColor;
			if ( unit === '%' ) {
				currentColor.position = convertPositionUnit( position )
			} else {
				currentColor.position = convertPositionUnit( position, true );
			}
			
			currentColor.unit = unit;
			sortByPosition( colors, true );
			
			output = cssGradient( 
				editorValue, 
				currentMode, 
				selectedColor,
				selectedGradient, 
			);
			
			return {
				output,
				positionChange: true,
				preview: { background: output },
				strip: { background: buildGradientStrip( colors, hints ) },
				...this.getCurrentOutput( 
					output, 
					editorValue.length, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc changes the editor's currently selected color or currently selected gradient from a preset
	 *       or if from user input, changes the currently selected color or overwrites all gradients (if a gradient is entered)
	 * @param object value - the new incoming pre-processed value
	 * @param string type - if the incoming value is a single color or gradient
	 * @param boolean fromInput - if the incoming value is from user-input
	 * @since 1.0.0
	*/
	setColorByRecord = ( value, type, fromInput ) => {
		if ( type === 'color' ) {
			const { rgba } = value;
			this.onChangeColor( rgba, true );
			return;
		}
		
		let output;
		this.setState( prevState => {
			const { 
				selectedColor,
				selectedGradient,
				value: editorValue,
				currentMode: mode,
			} = prevState;
			
			let currentGradient;
			const record = deepClone( value );
			const { value: recordValue } = record;
			const { length: recordLength } = recordValue;
			const currentMode = mode === 'color' ? 'gradient' : mode;
			
			if ( ! fromInput && recordLength < 2 ) {
				currentGradient = recordValue[0];
				const { colors, hints } = currentGradient;
				
				editorValue[ selectedGradient ] = currentGradient;
				output = cssGradient( 
					editorValue, 
					currentMode, 
					selectedColor, 
					selectedGradient 
				);

				return {
					...getEditorValues( prevState, selectedGradient, true ),
					strip: { background: buildGradientStrip( colors, hints ) },
					preview: { background: output },
					positionChange: true,
					editorUpdate: true,
					currentMode,
					output,
					...this.getCurrentOutput( 
						output, 
						editorValue.length, 
						currentGradient 
					),
				};
			}
			
			const newIndex = recordValue.length - 1;
			currentGradient = recordValue[ newIndex ];
			output = record.output;
			
			return {
				...record,
				...getEditorValues( record, newIndex, true ),
				currentMode: 'gradient',
				positionChange: true,
				editorUpdate: true,
				...this.getCurrentOutput( 
					output, 
					recordLength, 
					currentGradient, 
				),
			};
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed value
			const { onChange } = this.context;
			onChange( output );
		} );
	};
	
	/*
	 * @desc changes the selected preset group view to "defaults" or "custom"
	 * @param string value - "defaults" or "custom"
	 * @param string type - "colors" or "gradients"
	 * @since 1.0.0
	*/
	onChangePresetMenu = ( value, type ) => {
		const prop = type === 'color' ? 'colorPresetMenu' : 'gradPresetMenu';
		
		this.setState( { 
			positionChange: false,
			editorUpdate: false,
			[ prop ]: value,
		} );
	};
	
	/*
	 * @desc creates a new color or gradient custom preset
	 * @param string presetType - "color" or "gradient"
	 * @param boolean fromPreview - if the save is coming from the preview sidepanel, 
	 *                              the current mode needs to be checked
	 * @since 1.0.0
	*/
	onSavePreset = ( presetType, fromPreview ) => {
		let curColorPresets;
		let curGradPresets;
		
		this.setState( prevState => {
			const newState = { 
				editorUpdate: false,
				positionChange: false,
			};
			
			let custom;
			let record;
			const { presets } = prevState;
			const { 
				color: colorPresets, 
				gradient: gradientPresets,
			} = presets;
			
			const { custom: customColors } = colorPresets;
			const { custom: customGradients } = gradientPresets;
			
			curColorPresets = customColors;
			curGradPresets = customGradients;
			
			if ( presetType === 'color' ) {
				const { currentColor } = prevState;
				const { color } = currentColor;
				record = getColorData( color );
				custom = curColorPresets;
				newState.colorPresetMenu = 'custom';
			} else {
				const { 
					currentMode,
					selectedColor,
					currentGradient,
					selectedGradient,
					output: prevOutput,
					value: editorValue,
					preview: prevPreview,
				} = prevState;
				
				let newValue;
				let preview;
				let output;
				let strip;
				
				if ( ! fromPreview || currentMode === 'single_gradient' ) {
					newValue = editorValue.filter( gradient => gradient === currentGradient );
					output = cssGradient( 
						newValue, 
						currentMode, 
						selectedColor, 
						selectedGradient 
					);
					const { colors, hints } = newValue[0];
					preview = { background: output };
					strip = { background: buildGradientStrip( colors, hints ) };
				} else {
					output = prevOutput;
					newValue = editorValue;
					preview = { ...prevPreview };
					const { colors, hints } = editorValue[editorValue.length - 1];;
					strip = { background: buildGradientStrip( colors, hints ) };
				}
				
				record = {
					strip,
					output,
					preview,
					gradient: true,
					value: deepClone( newValue ),
				};
				
				custom = curGradPresets;
				newState.gradPresetMenu = 'custom';
			}
			
			custom.push( record );
			newState.presets = { ...presets };
			return newState;
		}, () => {
			// dispatch the change the top-level, notifying the admin of the changed preset
			const { dispatchPresets } = this.context;
			dispatchPresets( presetType, 'save', curColorPresets, curGradPresets );
		} );
	};
	
	/*
	 * @desc deletes the currently selected preset
	 * @param string presetType - "color" or "gradient"
	 * @param number index - the index of the preset to delete
	 * @since 1.0.0
	*/
	onDeletePreset = ( presetType, index ) => {
		let colors;
		let gradients;
		
		this.setState( prevState => {
			const { presets } = prevState;
			const { 
				color: colorPresets, 
				gradient: gradientPresets,
			} = presets;
			
			const { custom: customColors } = colorPresets;
			const { custom: customGradients } = gradientPresets;
			
			colors = customColors;
			gradients = customGradients;
			
			const group = presetType === 'color' ? colorPresets : gradientPresets;
			const { custom } = group;
			custom.splice( index, 1 );
			
			return { 
				editorUpdate: false,
				positionChange: false,
				presets: { ...presets },
			};
		}, () => {	
			// dispatch the change the top-level, notifying the admin of the changed preset
			const { dispatchPresets } = this.context;
			dispatchPresets( presetType, 'delete', colors, gradients );
		} );
	};
	
	/*
	 * @desc dispatch a change event on first-mount in case the original input value was invalid to begin with
	 * @since 1.0.0
	*/
	componentDidMount() {
		const { onChange } = this.context;
		const { output } = this.state;
		onChange( output ); 
	}
	
	render() {
		const { currentGradient, value: editorValue } = this.state;
		const { namespace, colorMode } = this.context;
		const { shape } = currentGradient;
		
		let className = '';
		if ( shape === 'size' ) {
			className = ` ${ namespace }-size-active`;
		}
		if ( colorMode === 'single' ) {
			className += ` ${ namespace }-single`;
		}
		
		return (
			<EditorContext.Provider value={ this.state }>
				<Container>
					<Header showHidePreview={ this.showHidePreview } />
					<Controls className={ className } />
					<Footer 
						clearLayers={ editorValue.length > 1 } 
						onClearGradient={ this.onClearGradient }
					/>
					{ colorMode !== 'single' && <SidePanels /> }
				</Container>
			</EditorContext.Provider>
		);
	}
}

Editor.contextType = AppContext;

export default Editor;
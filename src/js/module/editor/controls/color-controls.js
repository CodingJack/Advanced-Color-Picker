/*
 * the main entry point for all the color controls, including the color picker rainbow
*/

import React from 'react';
import ColorPalette from './color-controls/color-palette';
import ColorFields from './color-controls/color-fields';
import ColorList from './color-controls/color-list';
import ColorButtons from './color-controls/color-buttons';
import ColorPresets from './color-controls/color-presets';
import DragSlider from '../../../components/sliders/drag-slider';
import InputField from '../../../components/inputs/input-field';
import Panel from '../../../components/wrappers/panel';

import {
	AppContext,
} from '../../../context';

import {
	withEditorContext,
} from '../../../hoc/with-context';

import {
	shallowClone,
} from '../../../utils/editor';

import {
	sanitizeAlpha,
} from '../../../utils/colors';

import {
	toHsl,
	hslToRgb,
} from '../../../utils/hsl';

import {
	maxPositionPixels,
} from '../../../data/defaults';

const {
	Component,
} = React;

/*
 * @desc the main class that hosts all of the main color controls
 * @since 1.0.0
*/
class ColorControls extends Component {
	constructor() {
		super( ...arguments );
		
		const { editorContext } = this.props;
		const { currentColor } = editorContext;
		const { rgb: rgbData, opacity, position } = currentColor;

		this.state = {
			opacity,
			rgbData,
			position,
			colorMenu: 'rgb',
		};
	}
	
	/*
	 * @desc fires after the internal state has been changed, 
	 *       kicking up the color change to the editor level
	 * @since 1.0.0
	*/
	onUpdate = () => {
		const {
			rgbData,
			opacity,
		} = this.state;
		
		const value = rgbData.slice();
		value.length = 4;
		value[3] = opacity;
		
		const { editorContext } = this.props;
		const { onChangeColor } = editorContext;
		onChangeColor( value );
	};
	
	/*
	 * @desc fires after the internal state has been changed, 
	 *       kicking up the position change to the editor level
	 * @since 1.0.0
	*/
	onUpdatePosition() {
		const { position } = this.state;
		const { editorContext } = this.props;
		const { onChangePosition } = editorContext;
		onChangePosition( position, true );
	}
	
	/*
	 * @desc when state is set from below and kicked back up,
	 *       and then state is set here, there's no need for an additional render below
	 * @since 1.0.0
	*/
	shouldComponentUpdate() {
		if( this.bounce ) {
			this.bounce = false;
			return false;
		}
		
		return true;
	}
	
	/*
	 * @desc all state for the colors is internally managed,
	 *       but the state need to be overridden if a preset is selected, on user input or if
	 *       a position change occurs (coming from the controls when hovering over the mini preview)
	 * @since 1.0.0
	*/
	static getDerivedStateFromProps( props, state ) {
		const { bounce } = state;
		if ( bounce ) {
			return { bounce: false };
		}
		
		const { editorContext } = props;
		const { editorUpdate, positionChange } = editorContext;
		
		if( editorUpdate || positionChange ) {
			const { currentColor } = editorContext;
			const newState = {};
			
			if ( editorUpdate ) {
				const { rgb, opacity } = currentColor;
				newState.opacity = opacity;
				newState.rgbData = rgb;
			}
			if ( positionChange ) {
				const { position } = currentColor;
				newState.position = position;
			}
			newState.updatePalette = editorUpdate;
			return newState;
		}
		
		return null;
	}
	
	/*
	 * @desc fires whenever one of the color controls is changed
	 * @param string|array val - the changed value
	 * @param string type - the slug for the control that was changed
	 * @since 1.0.0
	*/
	onChange = ( val, type ) => {
		const newState = { bounce: true };
		const newVal = shallowClone( val );
		
		let colorChanged;
		let updatePalette;
		
		switch( type ) {
			case 'opacity':
				const opacity = sanitizeAlpha( newVal * 0.01 );
				newState.opacity = opacity;
				updatePalette = false;
				break;
			case 'rgb':
				newState.rgbData = newVal;
				updatePalette = true;
				colorChanged = true;
				break;
			case 'hsl':
				newState.rgbData = hslToRgb( ...newVal );
				updatePalette = true;
				colorChanged = true;
				break;
			case 'clear':
				newState.opacity = 0;
				updatePalette = false;
				break;
			case 'position':
				newState.position = val;
				updatePalette = false;
				break;
			default:
				newState.rgbData = newVal;
				updatePalette = false;
				colorChanged = true;
		}
		
		// if the change came from the color palette, which maintain its own state,
		// this will allow the color palette class to avoid the extra unneeded render
		newState.updatePalette = updatePalette;	
		
		this.setState( prevState => {
			const { opacity } = prevState;
			if ( colorChanged && opacity === 0 ) {
				newState.opacity = 1;
			}
			return newState;
		}, () => {
			this.bounce = true;
			if ( type !== 'position' ) {
				this.onUpdate();
			} else {
				this.onUpdatePosition();
			}
		} );
	};
	
	/*
	 * @desc changes the view between the rgb and hsl controls
	 * @param string colorMenu - "rgb" or "hsl"
	 * @since 1.0.0
	*/
	setColorMenu = colorMenu => {
		this.setState( { 
			colorMenu,
			updatePalette: false,
		} );
	};
	
	/*
	 * @desc changes the unit of the currently selected color
	 * @param string value - "%" or "px"
	 * @since 1.0.0
	*/
	changeUnit = value => {
		const { editorContext } = this.props;
		const { onChangeColorUnit } = editorContext;
		onChangeColorUnit( value );
	};

	render() {
		const { namespace, colorMode } = this.context;
		const { editorContext } = this.props;
		
		const {
			rgbData,
			opacity,
			position,
			colorMenu,
			updatePalette,
		} = this.state;
		
		const { 
			colors,
			onAddColor,
			currentColor,
			onSavePreset, 
			onDeleteColor,
		} = editorContext;
		
		const hslData = colorMenu === 'rgb' ? null : toHsl( ...rgbData );
		const opacityHighlighted = opacity !== 0 ? '' : `${ namespace }-highlighted`;
		const addColorClass = colors.length > 1 ? null : `${ namespace }-btn-green-active`;
		const { color, unit: colorUnit } = currentColor;
		
		return (
			<>
				<Panel className={ `${ namespace }-palette-panel` }>
					<div className={ `${ namespace }-view-palette` }>
						<ColorPalette 
							width={ 208 } 
							height={ 208 } 
							color={ rgbData }
							updatePalette={ updatePalette }
							onChange={ this.onChange }
						/>
						<DragSlider 
							reverse 
							className={ `${ namespace }-opacity-slider` } 
							prop="opacity" 
							value={ 100 - ( opacity * 100 ) } 
							onChange={ this.onChange }
						/>
					</div>
					<ColorButtons 
						colorMode={ colorMode }
						currentOutput={ color }
						onSavePreset={ onSavePreset }
						onChange={ this.onChange }
						onAddColor={ onAddColor }
						addColorClass={ addColorClass }
						onDeleteColor={ onDeleteColor }
						canDelete={ colors.length > 1 }
						opacityActive={ opacity === 0 }
					/>
				</Panel>
				<Panel className={ `${ namespace }-controls-panel` }>
					<ColorList 
						value={ rgbData } 
						onChange={ this.onChange }
					/>
					<InputField 
						slider 
						prop="opacity" 
						label="Opacity" 
						value={ opacity * 100 }
						onChange={ this.onChange }
						className={ opacityHighlighted }
					/>
					{ colorMode !== 'single' && (
						<InputField 
							slider 
							label="Pos"
							prop="position" 
							value={ position }
							unit={ colorUnit }
							onChange={ this.onChange }
							onChangeUnit={ this.changeUnit } 
							max={ colorUnit === '%' ? 100 : maxPositionPixels }
						/>
					) }
					<ColorFields 
						hsl={ hslData }
						rgb={ rgbData } 
						colorMenu={ colorMenu }
						onChange={ this.onChange } 
						setColorMenu={ this.setColorMenu }
					/>
				</Panel>
				{ colorMode === 'single' && (
					<Panel className={ `${ namespace }-presets-panel` }>
						<ColorPresets />
					</Panel>
				) }
			</>
		);
	}
}

ColorControls.contextType = AppContext;

export default withEditorContext( ColorControls );



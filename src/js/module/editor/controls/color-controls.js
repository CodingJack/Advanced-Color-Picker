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
	immutable,
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
	
	onUpdatePosition() {
		const { position } = this.state;
		const { editorContext } = this.props;
		const { onChangePosition } = editorContext;
		onChangePosition( position, true );
	}
	
	shouldComponentUpdate() {
		if( this.bounce ) {
			this.bounce = false;
			return false;
		}
		
		return true;
	}
	
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
	
	onChange = ( val, type ) => {
		const newState = { bounce: true };
		const newVal = immutable( val );
		
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
	
	setColorMenu = colorMenu => {
		this.setState( { 
			colorMenu,
			updatePalette: false,
		} );
	};
	
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



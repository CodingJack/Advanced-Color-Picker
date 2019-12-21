require('../scss/swatch.scss');

const namespace = 'cj-color';
const inputClass = 'cj-colorpicker';
const swatchClass = 'cj-colorpicker-swatch';
const swatchInnerClass = 'cj-colorpicker-swatch-inner';

import React from 'react';
import ReactDOM from 'react-dom';
import Loader from './loader';
import ErrorBoundary from './error';
import getColorData from './utils/data';

import { 
	AppContext,
} from './context';

import {
	defaultSettings,
	updateDefaults,
} from './settings';

import {
	formatPresets,
	verifySetting,
	setSwatchStyle,
	booleanSetting,
} from './utils/global';

import { 
	cssColor,
	verifyColorBySettings,
} from './utils/colors';

import {
	regGradient,
	regGradientNoConic,
} from './utils/regexp';


let root;
let publicPathSet;
let supportsConic;

const { 
	Component,
} = React;

const setDefaults = settings => {
	updateDefaults( settings );
	
	document.querySelectorAll( `.${ inputClass }` ).forEach( input => {
		const { dataset } = input;
		const { cjcp } = dataset;
		if ( cjcp ) {
			const { size, skin } = dataset;
			const swatch = input.closest( `.${ swatchClass }` );
			const inner = swatch.querySelector( `.${ swatchInnerClass }` );
			if ( swatch && inner ) {
				setSwatchStyle( swatch, inner, swatchClass, size, skin, defaultSettings );
			}
		}
	} );
};

const init = settings => {
	if ( supportsConic === undefined ) {
		const div = document.createElement( 'div' );
		div.style.background = 'conic-gradient(#FFF, #000)';
		supportsConic = div.style.background;
	}
	
	if ( ! Array.isArray( settings ) && typeof settings === 'object' ) {
		setDefaults( settings );
	}
	
	const inputs = document.querySelectorAll( `.${ inputClass }` );
	if ( ! inputs.length ) {
		return;
	}

	inputs.forEach( input => {
		if ( input.type.search( /text|hidden/ ) === -1 ) {
			return;
		}
		
		const { dataset } = input;
		const { cjcp } = dataset;
		if ( cjcp ) {
			return;
		}
		
		const swatch = document.createElement( 'span' );
		const inner = document.createElement( 'span' );
		
		const { size, skin } = dataset;
		setSwatchStyle( swatch, inner, swatchClass, size, skin, defaultSettings );
		
		const { value } = input;
		const { conic } = defaultSettings;
		const { output: processedColor } = getColorData( value, conic );
		
		inner.className = swatchInnerClass;
		inner.style.background = cssColor( processedColor );
		
		input.setAttribute( 'data-cjcp', true );
		swatch.appendChild( inner );
		
		input.parentNode.insertBefore( swatch, input );
		swatch.appendChild( input );
	} );
	
	if ( ! root || ! root.parentElement ) {
		if ( ! publicPathSet ) {
			const script = document.getElementById( 'cj-colorpicker' );
			if ( ! script ) {
				return;
			}
			const src = script.src.split( '/' );
			if ( src.length > 1 ) {
				src.splice( src.length - 1, 1 );
				__webpack_public_path__ = `${ src.join( '/' ) }/`;
			} else {
				__webpack_public_path__ = '/';
			}
			publicPathSet = true;
		}
		
		root = document.createElement( 'div' );
		root.className = namespace;
		document.body.appendChild( root );
		ReactDOM.render( <AdvColorPicker />, root );
	}
};

class AdvColorPicker extends Component {
	constructor( props ) {
		super( props );
		
		this.appContext = {
			root,
			namespace,
			onSave: this.onSave,
			onChange: this.onChange,
			onCancel: this.onCancel,
			setCursor: this.setCursor,
			dispatchPresets: this.dispatchPresets,
		};
	}
	
	state = {
		active: false,
	}
	
	onClick = e => {
		const { target } = e;
		const { classList } = target;
		
		let widget;
		if ( classList.contains( swatchClass ) ) {
			widget = target;
		} else {
			widget = target.closest( `.${ swatchClass }` );
		}
	
		if ( widget ) {
			const input = widget.querySelector( `.${ inputClass }` );
			const swatch = widget.querySelector( `.${ swatchInnerClass }` );
			
			if ( input && swatch ) {
				this.onOpen( input, widget, swatch );
			}
		}
	}
	
	onOpen( input, widget, swatch ) {
		const { value, dataset } = input;
		const { mode: dataMode } = dataset;
		
		const {
			conic,
			conicNote,
			outputBar,
			multiStops,
			onColorChange,
			onSaveDeletePreset,
			mode: settingsMode,
		} = defaultSettings;
		
		const colorMode = verifySetting( dataMode, settingsMode, 'mode' );
		this.appContext.colorMode = colorMode;
		
		const allowConic = supportsConic && booleanSetting( conic, true );
		this.appContext.allowConic = allowConic;
		
		const regExpGradient = allowConic ? regGradient : regGradientNoConic;
		this.appContext.regGradient = regExpGradient;
		
		if ( colorMode === 'full' ) {	
			this.appContext.conicNote = booleanSetting( conicNote, true );
			this.appContext.outputBar = booleanSetting( outputBar, true );
		} else {
			this.appContext.conicNote = false;
			this.appContext.outputBar = false;
		}
		
		this.appContext.multiStops = booleanSetting( multiStops, true );
		this.value = verifyColorBySettings( value, colorMode, regExpGradient, allowConic );
		this.originalValue = value;
		
		if ( typeof onColorChange === 'function' ) {
			this.colorChangeCallback = onColorChange;
		}
		if ( typeof onSaveDeletePreset === 'function' ) {
			this.savePresetCallback = onSaveDeletePreset;
		}
		
		this.input = input;
		this.swatch = swatch;
		this.setState( { active: true } );
	}
	
	onReset() {
		this.input = null;
		this.swatch = null;
		this.updated = false;
		this.mounted = false;
		
		root.classList.remove( `${ namespace }-active` );
		root.classList.remove( `${ namespace }-mounted` );
	}
	
	onClose() {
		this.setState( { active: false }, () => {
			this.onReset();
		} );
	}
	
	onUpdate( color ) {
		this.swatch.style.background = color;
		
		document.body.dispatchEvent(
			new CustomEvent( 'ColorChange', { detail: { 
				color, 
				input: this.input 
			} } ) 
		);
		if( this.colorChangeCallback ) {
			this.colorChangeCallback( this.input, color );
		}
	}
	
	setCursor = cursor => {
		if ( cursor ) {
			const el = document.querySelector( ':focus' );
			if( el ) {
				el.blur();
			}
			root.setAttribute( 'data-cursor', cursor );
		} else {
			root.removeAttribute( 'data-cursor' );
		}
	};
	
	dispatchPresets = ( group, action, colors, gradients ) => {
		const args = { 
			action,
			groupChanged: group,
			colorPresets: formatPresets( colors ), 
			gradientPresets: formatPresets( gradients ),
		}; 
		
		document.body.dispatchEvent(
			new CustomEvent( 'SaveDeleteColorPreset', { detail: { ...args } } )
		);
		if( this.savePresetCallback ) {
			this.savePresetCallback( args );
		}
	}
	
	onChange = color => {
		this.value = color;
		this.updated = true;
		this.onUpdate( color );
	}
	
	onSave = () => {
		this.onClose();
	}
	
	onCancel = () => {
		if ( this.updated ) {
			this.onUpdate( this.originalValue );
		}
		this.onClose();
	}
	
	componentDidUpdate() {
		const { active } = this.state;
		if ( ! this.mounted && active ) {
			this.mounted = true;
			root.classList.add( `${ namespace }-active` );
		}
	}
	
	componentDidMount() {
		document.body.addEventListener( 'click', this.onClick );
	}
	
	componentWillUnmount() {
		this.onReset();
		document.body.removeEventListener( 'click', this.onClick );
	}
	
	render() {
		const { active } = this.state;
		
		if ( active ) {
			return (
				<AppContext.Provider value={ this.appContext }>
					<ErrorBoundary onClose={ this.onCancel }>
						<Loader
							value={ this.value }
							resolve={ () => import( './module' ) }
						/>
					</ErrorBoundary>
				</AppContext.Provider>
			);
		}

		return null;
	}
}

window.advColorPicker = init;


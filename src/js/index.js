/*
 * the main entry point for the App
*/

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
let supportsMultiStop;

const { 
	Component,
} = React;

/*
 * @desc processes any incoming admin settings and rewrites swatch styles if new settings exist
 * @since 1.0.0
*/
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

/*
 * @desc the main function called to "init" the widget
 * 		 cycles through the appropriate input fields on the page and creates their respective swatches
 * 		 and also renders the App for the first time if it hasn't already been rendered
 * @since 1.0.0
*/
const init = settings => {
	if ( supportsConic === undefined ) {
		const div = document.createElement( 'div' );
		
		// test for conic support
		div.style.background = 'conic-gradient(#FFF, #000)';
		supportsConic = !! div.style.background;
		
		// test for multistop support
		div.style.background = 'linear-gradient(#FFF 0% 50%, #000 50% 100%)';
		supportsMultiStop = !! div.style.background;
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
	
	// allow for dynamic chunk loading where the path is unknown
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

/*
 * @desc the top-level component, mainly used to manage incoming settings
 * 	     and to dispatch changes back to the admin
 * @since 1.0.0
*/
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
	
	/*
	 * @desc a global click event handler to listen for when a swatch is clicked
	 * 		 "delegate" modal is used to eliminate potential garbage collection issues 
	 * @since 1.0.0
	*/
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
				this.onOpen( input, swatch );
			}
		}
	}
	
	/*
	 * @desc fires when a swatch has been clicked,
	 * 	     prepares the editor based on the current settings,
	 * 		 and finally opens the editor
	 * @param HTMLElement input - the current input field
	 * @param HTMLElement swatch - the current input fields respective swatch
	 * @since 1.0.0
	*/
	onOpen( input, swatch ) {
		const { value, dataset } = input;
		const { mode: dataMode } = dataset;
		
		const {
			conic,
			editorId,
			conicNote,
			outputBar,
			multiStops,
			modalBgColor,
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
		
		if ( editorId && typeof editorId === 'string' ) {
			root.id = editorId;
		}
		if ( modalBgColor && typeof modalBgColor === 'string' ) {
			root.style.background = modalBgColor;
		}
		
		defaultSettings.multiStops = supportsMultiStop ? booleanSetting( multiStops, true ) : false;
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
	
	/*
	 * @desc removes the editor from view after it's been closed
	 * @since 1.0.0
	*/
	onReset() {
		this.input = null;
		this.swatch = null;
		this.updated = false;
		this.mounted = false;
		
		root.classList.remove( `${ namespace }-active` );
		root.classList.remove( `${ namespace }-mounted` );
	}
	
	/*
	 * @desc fires any time the editor is to be closed (from "save" or "cancel")
	 * @since 1.0.0
	*/
	onClose() {
		this.setState( { active: false }, () => {
			this.onReset();
		} );
	}
	
	/*
	 * @desc fires any time the current color value has changed
	 * 	     and dispatches events to notify the admin
	 * @since 1.0.0
	*/
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
	
	/*
	 * @desc hack for Safari to ensure the appropriate cursor is always shown
	 * 		 when controls in the editor are being "dragged"
	 * @since 1.0.0
	*/
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
	
	/*
	 * @desc dispatches events to the admin when a custom preset has been saved or deleted
	 * @since 1.0.0
	*/
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
	
	/*
	 * @desc fires any time the current input value is meant to be changed
	 * @since 1.0.0
	*/
	onChange = color => {
		this.value = color;
		this.updated = true;
		this.onUpdate( color );
	}
	
	/*
	 * @desc fires when the user clicks the "check/save" button and then closes the editor
	 * @since 1.0.0
	*/
	onSave = () => {
		this.onClose();
	}
	
	/*
	 * @desc fires when the user clicks the "close" button, 
	 * 	     intending to close the editor and cancel any changes that may have been made
	 * @since 1.0.0
	*/
	onCancel = () => {
		if ( this.updated ) {
			this.onUpdate( this.originalValue );
		}
		this.onClose();
	}
	
	/*
	 * @desc used to fade-in the editor when its first opened
	 * @since 1.0.0
	*/
	componentDidUpdate() {
		const { active } = this.state;
		if ( ! this.mounted && active ) {
			this.mounted = true;
			root.classList.add( `${ namespace }-active` );
		}
	}
	
	/*
	 * @desc attaches the main click event handler to listen for swatch clicks after the App first renders
	 * @since 1.0.0
	*/
	componentDidMount() {
		document.body.addEventListener( 'click', this.onClick );
	}
	
	/*
	 * @desc removes the main click event listener on unmount
	 * @since 1.0.0
	*/
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


import React from 'react';
import SelectBox from '../../../../components/select-box';
import Row from '../../../../components/wrappers/row';

import {
	EditorContext,
} from '../../../../context';

import {
	withAppContext,
} from '../../../../hoc/with-context';

import {
	rgbToHex,
	hexToRGB,
	toFullHex,
	isValidHex,
	isValidRGB,
} from '../../../../utils/colors';

const {
	Component,
} = React;

class ColorList extends Component {
	constructor() {
		super( ...arguments );
		
		const { value } = this.props;
		const hex = rgbToHex( ...value );

		this.state = {
			value: hex,
			isValid: true,
		};
	}
	
	onFocus = e => {
		const { target } = e;
		const { value } = target;
		
		this.setState( { 
			blurred: false, 
			origValue: value,
		}, () => {
			target.select();
		} );
	};
	
	onBlur = () => {
		let callback;
		let callbackValue;
		
		this.setState( prevState => {
			const { isValid } = prevState;
			if ( isValid ) {
				return null;
			}
			
			const newState = { blurred: true, isValid: true };
			let { value } = prevState;
			
			value = `#${ value.replace( '#', '' ) }`;
			callback = true;
			
			if( ! isValidHex( value, true ) ) {
				const { origValue } = prevState;
				newState.value = origValue;
				callbackValue = origValue;
			} else {
				callbackValue = value;
			}
			
			return newState;
		}, () => {
			if ( callback ) {
				const { onChange } = this.props;
				onChange( hexToRGB( callbackValue ) );
			}
		} );
	};
	
	onInputChange = e => {
		const { target } = e;
		const { value } = target;
		
		if ( ! /^[#0-9A-F]*$/i.test( value ) ) {
			return;
		}
		
		let isValid = isValidHex( value );
		this.setState( { value, isValid }, () => {
			if( isValid ) {
				const { onChange } = this.props;
				onChange( hexToRGB( value ), 'rgb' );
			}
		} );
	};
	
	onChange = ( value, prop, index ) => {
		const { colors } = this.context;
		
		this.setState( { 
			value: colors[index],
			isValid: true,
		}, () => {
			const { onActivateColor } = this.context;
			onActivateColor( index );
		} );
	}
	
	static getDerivedStateFromProps( props, state ) {
		const {
			isValid,
			blurred,
			value: stateValue,
		} = state;
		
		const { value: propValue } = props;
		const hex = isValidRGB( Array.from( propValue ) ) ? rgbToHex( ...propValue, false ) : stateValue;
		
		let value;
		if ( ! blurred ) {
			value = isValid ? hex : stateValue;
		} else {
			value = hex;
		}
		
		return { value };
	}
	
	render() {
		const { appContext, className } = this.props;
		const { namespace, colorMode } = appContext;
		const { value: stateValue } = this.state;
		const { colors, selectedColor, onSwapColor } = this.context;
		const parsedValue = stateValue !== '' ? `#${ stateValue.replace( '#', '' ) }` : '';
		
		const list = {};
		colors.forEach( ( color, index ) => {
			const { hex } = color;
			list[ index ] = {
				label: toFullHex( hex ),
				preview: hex,
			}
		} );
		
		return (
			<Row className={ `${ namespace }-row-spacer` }>
				<SelectBox 
					input
					isLong
					preview
					prop="hex"
					label="Color"
					list={ list }
					className={ className }
					value={ selectedColor }
					inputValue={ parsedValue }
					onSwapItem={ onSwapColor }
					onFocus={ this.onFocus }
					onBlur={ this.onBlur }
					onChange={ this.onChange }
					onInputChange={ this.onInputChange }
					currentPreview={ { background: list[ selectedColor ].preview } }
					pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
					isSingle={ colorMode === 'single' }
				/>
			</Row>
		);
	}
};

ColorList.contextType = EditorContext;

export default withAppContext( ColorList );

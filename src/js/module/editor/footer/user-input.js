import React from 'react';
import getColorData from '../../../utils/data';

import {
	EditorContext,
} from '../../../context';

import {
	withAppContext,
} from '../../../hoc/with-context';

import {
	isValidColor,
} from '../../../utils/colors';

const {
	Component,
	createRef,
} = React;

class UserInput extends Component {
	constructor() {
		super( ...arguments );
		this.inputRef = createRef();
	}
	
	onChange = () => {
		const { current: inputRef } = this.inputRef;
		const { value: inputValue } = inputRef;
		
		const { appContext } = this.props;
		const { colorMode, allowConic, regGradient } = appContext;
		
		let typedText = inputValue.toLowerCase()
								  .replace( /;|\:|\{|\}/g, '' )
								  .replace( /  +/g, ' ' )
								  .replace( /-webkit-|-moz-/, '' )
								  .replace( /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/g, '' )
								  .replace( 'background-color', '' )
								  .replace( 'background-image', '' )
								  .replace( 'background', '' )
								  .trim();
								  
		while( typedText.charAt( typedText.length - 1 ) === ',' ) {
			typedText = typedText.slice( 0, -1 ); 
		}
		
		if ( typedText !== 'transparent' ) {
			let isValidGradient;
			if ( colorMode !== 'single' ) {
				isValidGradient = typedText.length > 23 && regGradient.test( typedText );
			}
			if ( ! isValidColor( typedText, true ) && ! isValidGradient ) {
				this.data = null;
				return;
			}
		}
		
		const data = getColorData( typedText, allowConic );
		const { gradient } = data;
		const type = ! gradient ? 'color' : 'gradient';
		const { setColorByRecord } = this.context;
		
		this.data = data;
		setColorByRecord( data, type, true );
	}
	
	componentDidUpdate() {
		if ( this.data ) {
			const { gradient } = this.data;
			if ( ! gradient ) {
				const { hex } = this.data;
				const { currentColor } = this.context;
				const { hex: editorHex } = currentColor;

				if ( hex !== editorHex ) {
					this.resetInput();
				}
			} else {
				let { output } = this.data;
				const { output: editorOutput } = this.context;
				
				if ( output ) {
					output = output.toLowerCase();
				}
				if ( output !== editorOutput.toLowerCase() ) {
					this.resetInput();
				}
			}
		}
	}
	
	resetInput() {
		const { current: inputRef } = this.inputRef;
		this.data = null;
		inputRef.value = '';
	}
	
	componentWillUnmount() {
		this.inputRef = null;
	}
	
	render() {
		const { appContext } = this.props;
		const { namespace, colorMode } = appContext;
		const placeholder = colorMode !== 'single' ? 'Enter a Color or Gradient' : 'Enter a Color';
		
		return (
			<div className={ `${ namespace }-search-input-wrap` }>
				<div className={ `${ namespace }-search-input` }>
					<input 
						type="text" 
						className={ `${ namespace }-input` } 
						pattern="[a-zA-Z0-9-,.%();# ]+" 
						placeholder={ placeholder }
						onChange={ this.onChange } 
						ref={ this.inputRef }
					/>
				</div>
			</div>
		);
	}
}

UserInput.contextType = EditorContext;

export default withAppContext( UserInput );
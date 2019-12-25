import React from 'react';
import Button from './button';

import {
	AppContext,
} from '../../context';

const {
	Component,
} = React;

/*
 * @desc used to copy a color or gradient from the editor onto the user's clipboard
 * @since 1.0.0
*/
class CopyBtn extends Component {
	constructor() {
		super( ...arguments );
	}
	
	state = {
		copyIcon: 'assignment',
	};
	
	resetIcon = () => {
		this.clicked = false;
		this.setState( { copyIcon: 'assignment' } );
	};
	
	onClick = () => {
		if ( ! this.clicked ) {
			this.clicked = true;
			this.setState( { copyIcon: 'check' } );
		}
	};
	
	/*
	 * @desc temporary textarea used to mimic the clipboard copying
	 * 	     when the button is clicked, the state changes and this is added to the DOM
	 *       then immediately after the copying is done the state is reset and the textarea element is removed
	 * @since 1.0.0
	*/
	onMountTextArea = textArea => {
		if ( textArea ) {
			textArea.select();
			document.execCommand( 'copy' );
			clearTimeout( this.timer );
			this.timer = setTimeout( this.resetIcon, 500 );
		}
	};
	
	componentWillUnmount() {
		clearTimeout( this.timer );
	}
	
	render() {
		const { copyIcon } = this.state;
		const { value, className, type = 'small' } = this.props;
		const copiedValue = value.charAt( 0 ) !== '#' ? value : value.toUpperCase();
		
		return (
			<>
				<Button
					type={ type }
					icon={ copyIcon }
					onClick={ this.onClick }
					className={ className }
				/>
				{ copyIcon === 'check' && (
					<textarea ref={ this.onMountTextArea } value={ copiedValue } readOnly />
				) }
			</>
		);
	}
};

CopyBtn.contextType = AppContext;

export default CopyBtn;
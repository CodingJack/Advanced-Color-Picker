import React from 'react';
import Button from './button';

import {
	AppContext,
} from '../../context';

const {
	Component,
} = React;

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
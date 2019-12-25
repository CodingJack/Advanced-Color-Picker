import React from 'react';

import {
	AppContext,
} from './context';

const {
	Component,
} = React;

/*
 * @desc the top-level ErrorBoundary to catch any errors that may occur
 * @since 1.0.0
*/
class ErrorBoundary extends Component {
	constructor() {
		super();
		this.state = { hasError: false };
	}

	static getDerivedStateFromError( error ) {
		return { hasError: error };
	}

	render() {
		const { hasError } = this.state;
		
		if ( hasError ) {
			const { namespace } = this.context;
			const { onClose } = this.props;
			
			return (
				<div className={ `${ namespace }-error` }>
					<p>
						Something went wrong.  Please <a href="https://github.com/CodingJack/Advanced-Color-Picker/issues/new">report</a> the error below.	
					</p>
					<p><i>{ hasError.toString() }</i></p>
					<p>
						<button onClick={ onClose }>Close Widget</button>
					</p>
				</div>
			);
		}

		const { children } = this.props;
		return children;
	}
}

ErrorBoundary.contextType = AppContext;

export default ErrorBoundary;

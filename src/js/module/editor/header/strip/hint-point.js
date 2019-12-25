import React from 'react';

import {
	AppContext,
} from '../../../../context';

const {
	Component,
} = React;

/*
 * @desc displays the hint percentage tooltip when mousing over the hint pair controls
 * @since 1.0.0
*/
class HintPoint extends Component {
	constructor() {
		super( ...arguments );
		const { index } = this.props;
		this.index = index;
	}
	
	/*
	 * @desc fades in the tooltip if a new hint-pair is hovered for a smoother visual
	 * @since 1.0.0
	*/
	componentDidUpdate() {
		const { index } = this.props;
		if ( this.index !== index ) {
			const { namespace } = this.context;
			this.index = index;
			
			this.ref.classList.remove( `${ namespace }-fade-in` );
			void this.ref.offsetWidth;
			this.ref.classList.add( `${ namespace }-fade-in` );
		}
	}
	
	render() {
		const { namespace } = this.context;
		const { hint } = this.props;
		const { position, percentage } = hint;
		
		return (
			<div className={ `${ namespace }-gradient-points ${ namespace }-gradient-hints` }>
				<span 
					className={ `${ namespace }-gradient-hint-wrap` } 
					style={ { left: `${ position }%` } }
					ref={ ref => ( this.ref = ref ) }
				>
					<span className={ `${ namespace }-gradient-hint` } >
						<span className={ `${ namespace }-gradient-hint-number` }>
							{ `${ Math.round( percentage ) }%` }
						</span>
						<span className={ `${ namespace }-gradient-hint-triangle` }></span>
					</span>
				</span>
			</div>
		);
	}
}

HintPoint.contextType = AppContext;

export default HintPoint;

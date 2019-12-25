import React from 'react';

import {
	AppContext,
} from '../context';

const {
	Component,
} = React;

/*
 * @desc adds scrolling capability to any given container of content
 * @since 1.0.0
*/
class Scrollable extends Component {
	constructor() {
		super( ...arguments );
	}
	
	/*
	 * @desc user is scrolling content with the mouse-wheel
	 * @since 1.0.0
	*/
	onScroll = e => {
		e.preventDefault();
		
		const { target } = e;
		const { scrollTop } = target;
		
		let handleY = ( ( scrollTop / this.containerHeight ) * this.handleHeight );
		this.handleY = Math.max( 0, Math.min( this.handleDif, handleY ) );
		
		window.cancelAnimationFrame( this.requestAnime );
		this.requestAnime = window.requestAnimationFrame( this.updateScroll );
	};
	
	/*
	 * @desc respositions the scroll handle after the mouse-wheel is scrolled
	 * @since 1.0.0
	*/
	updateScroll = () => {
		this.handle.style.marginTop = `${ this.handleY }px`; 
	};
	
	/*
	 * @desc sets the scroll handle height 
	 *  	 and also does some calculations in preparation of potential scrolling
	 * @since 1.0.0
	*/
	onMouseEnter = () => {
		const containerRect = this.container.getBoundingClientRect();
		const contentRect = this.content.getBoundingClientRect();
		
		const { height: containerHeight } = containerRect;
		const { height: contentHeight } = contentRect;
		
		const handleHeight = ( containerHeight / contentHeight ) * containerHeight;
		this.handleHeight = handleHeight;
		
		this.containerHeight = containerHeight;
		this.handleDif = containerHeight - handleHeight;
		this.contentDif = contentHeight - containerHeight;
		this.handle.style.height = `${ handleHeight }px`;
	};
	
	/*
	 * @desc user has "mouse downed" the scroll handle
	 * @since 1.0.0
	*/
	onMouseDown = e => {
		e.preventDefault();
		const { pageY } = e;
		
		this.pageY = pageY;
		this.startY = this.handle.offsetTop;
		
		const { namespace, setCursor } = this.context;
		this.handle.classList.add( `${ namespace }-scrolling` );
		setCursor( 'default' );
		
		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseup', this.onMouseUp );
		document.addEventListener( 'mouseleave', this.onMouseUp );
	};
	
	/*
	 * @desc user is scrolling content with the scroll handle
	 * @since 1.0.0
	*/
	onMouseMove = e => {
		const { pageY } = e;
		const scrollY = Math.max( 0, 
			Math.min( 
				pageY - this.pageY + this.startY, 
				this.handleDif 
			) 
		);
		this.container.scrollTop = Math.max( 0, 
			Math.min( 
				( scrollY / this.handleDif ) * this.contentDif, 
				this.contentDif 
			) 
		);
		this.handle.style.marginTop = `${ scrollY }px`;
	};
	
	/*
	 * @desc user was scrolling content with the scroll handle and has finished
	 * @since 1.0.0
	*/
	onMouseUp = () => {
		this.removeListeners();
		const { namespace, setCursor } = this.context;
		this.handle.classList.remove( `${ namespace }-scrolling` );
		setCursor();
	}
	
	/*
	 * @desc cleanup after scrolling has ended
	 * @since 1.0.0
	*/
	removeListeners() {
		window.cancelAnimationFrame( this.requestAnime );
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
	};
	
	/*
	 * @desc reset the scroll position of the container as browser's like to cache this 
	 * @since 1.0.0
	*/
	componentDidMount() {
		this.container.scrollTop = 0;
	}
	
	/*
	 * @desc cleanup when the component is no longer present
	 * @since 1.0.0
	*/
	componentWillUnmount() {
		this.removeListeners();
		this.container = null;
		this.content = null;
		this.handle = null;
	}
	
	render() {
		const { children } = this.props;
		const { namespace } = this.context;
		
		return (
			<div className={ `${ namespace }-scroll-wrap` }>
				<div 
					className={ `${ namespace }-scrollable` }
					ref={ container => ( this.container = container ) }
					onMouseEnter={ this.onMouseEnter }
					onScroll={ this.onScroll }
				>
					<div 
						className={ `${ namespace }-scrollable-content` }
						ref={ content => ( this.content = content ) }
					>{ children }</div>
				</div>
				<span className={ `${ namespace }-scrollbar` }>
					<span 
						className={ `${ namespace }-scrollbar-handle` }
						ref={ handle => ( this.handle = handle ) }
						onMouseDown={ this.onMouseDown }
					>
						<span className={ `${ namespace }-scrollbar-handle-inner` }></span>
					</span>
				</span>
			</div>
		);
	}
}

Scrollable.contextType = AppContext;

export default Scrollable;

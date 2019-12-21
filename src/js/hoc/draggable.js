import React from 'react';

import {
	EditorContext,
} from '../context';

import {
	withAppContext,
} from './with-context';

const {
	Component,
	Children,
	cloneElement,
} = React;

class Draggable extends Component {
	constructor() {
		super( ...arguments );
	}

	onMouseDown = e => {
		e.preventDefault();
		
		const { pageX, pageY } = e;
		const { appContext } = this.props;
		const { containerRef } = this.context;
		const { current: container } = containerRef;
		const { outputBar, setCursor } = appContext;
		
		let outputBarHeight;
		if ( outputBar ) {
			const { outputBarRef } = this.props;
			const { current: currentBar } = outputBarRef;
			if ( currentBar ) {
				const outputBarRect = currentBar.getBoundingClientRect();
				const { height: barHeight } = outputBarRect;
				outputBarHeight = barHeight;
			}
		} else {
			outputBarHeight = 0;
		}

		const rect = container.getBoundingClientRect();
		const { width, height, left, top } = rect;

		this.dragValues = {
			maxWidth: window.innerWidth - width,
			maxHeight: window.innerHeight - height - outputBarHeight,
			moveX: Math.max( 0, Math.min( pageX - left, width ) ),
			moveY: Math.max( 0, Math.min( pageY - top, height ) ),
		};
		
		setCursor( 'move' );
		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseup', this.onMouseUp );
		document.addEventListener( 'mouseleave', this.onMouseUp );
	};

	onMouseMove = e => {
		const { containerRef } = this.context;
		const { current: container } = containerRef;
		const { pageX, pageY } = e;

		const {
			moveX,
			moveY,
			maxWidth,
			maxHeight,
		} = this.dragValues;

		const x = Math.max( 0, Math.min( pageX - moveX, maxWidth ) );
		const y = Math.max( 0, Math.min( pageY - moveY, maxHeight ) );

		container.style.left = `${ x }px`;
		container.style.top = `${ y }px`;
	}

	onMouseUp = () => {
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );
		document.removeEventListener( 'mouseleave', this.onMouseUp );
		
		const { appContext } = this.props;
		const { setCursor } = appContext;
		
		setCursor();
		this.dragValues = null;
	}

	componentWillUnmount() {
		this.onMouseUp();
	}

	render() {
		const { children } = this.props;
		return Children.map(
			children,
			child => cloneElement(
				child,
				{ draggable: { onMouseDown: this.onMouseDown } }
			)
		);
	}
}

Draggable.contextType = EditorContext;

export default withAppContext( Draggable );

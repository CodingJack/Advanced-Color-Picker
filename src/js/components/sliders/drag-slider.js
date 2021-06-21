import React from 'react';

import {
  AppContext,
} from '../../context';

const {
  PureComponent,
  createRef,
} = React;

/*
 * @desc essentially creates a vertical range slider 
 * @since 1.0.0
*/
class DragSlider extends PureComponent {
  constructor() {
    super(...arguments);
    this.stripRef = createRef();
  }

  /*
   * @desc user has "moused down" on the slider at any given point
   * @since 1.0.0
  */
  onMouseDown = e => {
    e.preventDefault();
    const { setCursor } = this.context;
    setCursor('vertical');

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseleave', this.onMouseUp);
    document.addEventListener('mouseup', this.onMouseUp);

    this.onMouseMove(e);
  }

  /*
   * @desc user is "dragging" the slider handle
   * @since 1.0.0
  */
  onMouseMove = e => {
    const {
      prop,
      reverse,
    } = this.props;

    const { pageY } = e;
    const { onChange } = this.props;
    const { current: strip } = this.stripRef;

    const rect = strip.getBoundingClientRect();
    const { height, top } = rect;

    const perc = Math.max(0,
      Math.min(
        pageY - window.scrollY - top,
        height
      )
    );
    const value = (perc / height) * 100;
    const newValue = reverse ? 100 - value : value;

    onChange(newValue, prop, true);
  }

  /*
   * @desc cleanup after "dragging" is complete
   * @since 1.0.0
  */
  removeListeners() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseleave', this.onMouseUp);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  /*
   * @desc user has finished "dragging"
   * @since 1.0.0
  */
  onMouseUp = () => {
    this.removeListeners();
    const { setCursor } = this.context;
    setCursor();
  }

  componentWillUnmount() {
    this.removeListeners();
    this.stripRef = null;
  }

  render() {
    const {
      value,
      className,
    } = this.props;

    const { namespace } = this.context;
    const extraClass = className ? ` ${className}` : '';
    const style = { top: `${value}%` };

    return (
      <div
        className={`${namespace}-strip-wrap${extraClass}`}
        onMouseDown={this.onMouseDown}
      >
        <div className={`${namespace}-strip`} ref={this.stripRef}>
          <span className={`${namespace}-strip-handle`} style={style}></span>
        </div>
      </div>
    );
  }
}

DragSlider.contextType = AppContext;

export default DragSlider;

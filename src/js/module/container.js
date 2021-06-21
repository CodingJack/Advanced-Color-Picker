import React from 'react';
import FullPreview from './full-preview';
import Draggable from '../hoc/draggable';

import {
  EditorContext
} from '../context';

import {
  withAppContext,
} from '../hoc/with-context';

const {
  Component,
  createRef,
  forwardRef,
} = React;

const posMarginTop = 0.15;

/*
 * @desc used to inherit the "draggable" events from the Draggable HOC
 * @since 1.0.0
*/
const MainContainer = forwardRef(({ namespace, children, draggable }, ref) => (
  <div className={`${namespace}-container`} ref={ref}>
    <div className={`${namespace}-container-drag`} {...draggable}></div>
    {children}
  </div>
));

/*
 * @desc the main editor container which positions and repositions itself on resize
 * @since 1.0.0
*/
class Container extends Component {
  constructor() {
    super(...arguments);
    this.outputBarRef = createRef();
  }

  state = {
    previewSize: 'full',
  };

  /*
   * @desc positions the container on first mount and also after a window resize event
   *       and also determines if the widget should be scrollable if the user's screen height is too small
   * @since 1.0.0
  */
  positionContainer = () => {
    const { containerRef } = this.context;
    const { current: container } = containerRef;
    const { current: outputBar } = this.outputBarRef;
    const { width, height } = container.getBoundingClientRect();
    const { appContext } = this.props;
    const { namespace, root } = appContext;
    const { innerWidth: winWidth, innerHeight: winHeight } = window;

    let containerHeight = height;
    if (outputBar) {
      const outputBarRect = outputBar.getBoundingClientRect();
      const { height: barHeight } = outputBarRect;
      containerHeight += barHeight;
    }

    let posTop = Math.max((winHeight * 0.5) - (containerHeight * 0.5), 0);
    let posLeft = Math.max((winWidth * 0.5) - (width * 0.5), 0);

    posTop -= Math.abs((winHeight - containerHeight)) * posMarginTop;
    posTop = Math.max(posTop, 0);
    posLeft = Math.max(posLeft, 0);

    if (posTop > 0) {
      if (this.overflowY) {
        this.overflowY = false;
        root.classList.remove(`${namespace}-overflow-y`);
      }
    } else if (!this.overflowY) {
      this.overflowY = true;
      root.classList.add(`${namespace}-overflow-y`);
    }

    if (posLeft > 0) {
      if (this.overflowX) {
        this.overflowX = false;
        root.classList.remove(`${namespace}-overflow-x`);
      }
    } else if (!this.overflowX) {
      this.overflowX = true;
      root.classList.add(`${namespace}-overflow-x`);
    }

    container.style.top = `${posTop}px`;
    container.style.left = `${posLeft}px`;
  }

  /*
   * @desc large preview has been closed
   * @since 1.0.0
  */
  onClosePreview = () => {
    const { showHidePreview } = this.context;
    showHidePreview();
  };

  /*
   * @desc large preview size has been changed
   * @since 1.0.0
  */
  onChangePreviewSize = (e, previewSize) => {
    e.stopPropagation();
    this.setState({ previewSize });
  };

  /*
   * @desc add/remove overflow class allowing for the large preview to be scrolled
   * @since 1.0.0
  */
  addRemoveOverflow(add) {
    const { appContext } = this.props;
    const { root, namespace } = appContext;
    if (add) {
      this.previewActivated = true;
      root.classList.add(`${namespace}-no-overflow`);
    } else {
      this.previewActivated = false;
      root.classList.remove(`${namespace}-no-overflow`);
    }
  }

  /*
   * @desc position the widget initially and add the resize listener
   * @since 1.0.0
  */
  componentDidMount() {
    const { appContext } = this.props;
    const { namespace, root } = appContext;

    this.positionContainer();
    root.classList.add(`${namespace}-mounted`);
    window.addEventListener('resize', this.positionContainer);
  }

  /*
   * @desc add/remove overflow class whenever the full preview is activated/deactivated
   * @since 1.0.0
  */
  componentDidUpdate() {
    const { previewActive } = this.context;
    if (previewActive) {
      if (!this.previewActivated) {
        this.addRemoveOverflow(true);
      }
    } else if (this.previewActivated) {
      this.addRemoveOverflow();
    }
  }

  /*
   * @desc cleanup after the widget has been closed
   * @since 1.0.0
  */
  componentWillUnmount() {
    window.removeEventListener('resize', this.positionContainer);
    this.outputBarRef = null;
  }

  render() {
    const {
      output,
      preview,
      currentMode,
      containerRef,
      previewActive,
    } = this.context;

    const { children, appContext } = this.props;
    const { namespace, outputBar } = appContext;
    const { previewSize } = this.state;

    let activeClass;
    let cancelEvent;
    let textOutput = output;

    if (!previewActive) {
      activeClass = '';
    } else {
      activeClass = ` ${namespace}-bg-active`;
      cancelEvent = this.onClosePreview;
    }

    if (currentMode === 'color' && output.charAt(0) === '#') {
      textOutput = output.toUpperCase();
    }

    return (
      <>
        <div
          className={`${namespace}-bg${activeClass}`}
          data-size={previewSize}
          onClick={cancelEvent}
        >
          {previewActive && (
            <FullPreview
              preview={preview}
              previewSize={previewSize}
              onChangePreviewSize={this.onChangePreviewSize}
              onClosePreview={this.onClosePreview}
            />
          )}
        </div>
        <Draggable outputBarRef={this.outputBarRef}>
          <MainContainer
            namespace={namespace}
            ref={containerRef}
          >{children}</MainContainer>
        </Draggable>
        {outputBar && !previewActive && (
          <div className={`${namespace}-code`} ref={this.outputBarRef}>
            <span><span>{textOutput}</span></span>
          </div>
        )}
      </>
    );
  }
}

Container.contextType = EditorContext;

export default withAppContext(Container);
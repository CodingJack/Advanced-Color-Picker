import React from 'react';

import {
  AppContext,
} from '../../../../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc represents a hint pair item, reusing preset item class names as the display is similar
 * @since 1.0.0
*/
const HintPair = ({ className, style, blank }) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;

  return (
    <span className={`${namespace}-preset-container${className}`}>
      <span className={`${namespace}-preset-inner`}>
        <span className={`${namespace}-preset-back`}>
          <span
            className={`${namespace}-preset`}
            style={style}
          ></span>
          {!blank && <span className={`${namespace}-shade`}></span>}
        </span>
      </span>
    </span>
  );
};

export default memo(HintPair);
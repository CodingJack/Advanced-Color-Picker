import React from 'react';
import Icon from '../../components/icon';

import {
  AppContext,
} from '../../context';

const {
  memo,
  useContext,
} = React;

const defaultIcons = [
  'arrow_drop_up',
  'arrow_drop_down'
];

/*
 * @desc used for the "up" and "down" arrows to mimic "number input" controls
 * @since 1.0.0
*/
const RangeButtons = ({
  onMouseUp,
  onMouseLeave,
  arrowUpClick,
  arrowDownClick,
  icons = defaultIcons,
}) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;

  return (
    <span className={`${namespace}-range-btn-wrap`}>
      <span
        className={`${namespace}-range-btn ${namespace}-range-btn-up`}
        onMouseDown={arrowUpClick}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
      >
        <Icon type={icons[0]} />
      </span>
      <span
        className={`${namespace}-range-btn ${namespace}-range-btn-down`}
        onMouseDown={arrowDownClick}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
      >
        <Icon type={icons[1]} />
      </span>
    </span>
  );
};

export default memo(RangeButtons);
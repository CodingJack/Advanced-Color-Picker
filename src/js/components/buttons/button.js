import React from 'react';
import Icon from '../icon';

import {
  AppContext,
} from '../../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc creates a clickable button that could have a variety of visual states
 * @since 1.0.0
*/
const Button = ({
  type,
  icon,
  label,
  color,
  active,
  onClick,
  disabled,
  className,
  activeState,
  activeDisabled,
  dataAttrs = {},
}) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;

  let btnClass = `${namespace}-btn`;
  let extraClass = className ? ` ${className}` : '';

  if (type !== 'large') {
    if (type) {
      extraClass += ` ${namespace}-btn-${type}`;
    }
  } else {
    btnClass += '-large';
  }
  if (active) {
    btnClass += ` ${namespace}-btn-active`
  }
  if (activeState) {
    btnClass += ` ${namespace}-btn-active-state`;
  }
  if (disabled) {
    btnClass += ` ${namespace}-disabled`;
  } else if (activeDisabled) {
    btnClass += ` ${namespace}-active-disabled`;
  }
  if (color) {
    btnClass += ` ${namespace}-btn-${color}`;
  }

  return (
    <span
      className={`${btnClass}${extraClass}`}
      onClick={onClick}
      {...dataAttrs}
    >
      {icon && <Icon type={icon} />}
      {label && label}
    </span>
  );
};

export default memo(Button);
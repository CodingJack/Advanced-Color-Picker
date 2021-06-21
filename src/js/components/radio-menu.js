import React from 'react';

import {
  AppContext,
} from '../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc creates a menu of radio inputs
 * @since 1.0.0
*/
const RadioMenu = ({ active, list, type, className, onChange }) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;
  const extraClass = !className ? '' : ` ${className}`;

  let ids = type || '';
  if (ids) {
    ids = `-${ids}-`;
  }

  return (
    <div className={`${namespace}-menu${extraClass}`}>
      {
        Object.keys(list).map(value => {
          const label = list[value];
          return (
            <span
              key={`${namespace}-radio-${value}`}
              className={`${namespace}-radio-wrap`}
            >
              <input
                id={`${namespace}${ids}${value}-mode`}
                className={`${namespace}-radio`}
                type="radio"
                value={value}
                checked={active === value}
                onChange={e => onChange(e.target.value, type)}
              />
              <label
                htmlFor={`${namespace}${ids}${value}-mode`}
                className={`${namespace}-radio-label`}
              >
                <span className={`${namespace}-radio-label-text`}>{label}</span>
              </label>
            </span>
          );
        })
      }
    </div>
  );
};

export default memo(RadioMenu);

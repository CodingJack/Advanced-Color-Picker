import React from 'react';

import {
  AppContext,
} from '../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc creates an "on/off" toggle button, mimicing radio inputs
 * @since 1.0.0
*/
const Toggle = ({ value, onChange, type, label }) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;
  const activeClass = !value ? '' : ` ${namespace}-toggle-active`

  return (
    <>
      <span
        className={`${namespace}-toggle${activeClass}`}
        onClick={() => onChange(!value, type)}
      >
        <span className={`${namespace}-toggle-wrap`}>
          <span className={`${namespace}-toggle-itm ${namespace}-toggle-itm-on`}>
            <span>ON</span>
          </span>
          <span className={`${namespace}-toggle-itm ${namespace}-toggle-itm-off`}>
            <span>OFF</span>
          </span>
        </span>
      </span>
      {label && <span>{label}</span>}
    </>
  );
};

export default memo(Toggle);
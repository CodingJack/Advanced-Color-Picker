import React from 'react';
import Button from '../components/buttons/button';

import {
  AppContext,
} from '../context';

const {
  useContext,
} = React;

/*
 * @desc creates a 3x3 grid of clickable buttons
 *  	 where the buttons act like radio checkboxes
 *       used for changing the linear-gradient direction when hovering over the preview
 * @since 1.0.0
*/
const Grid = ({ list, value, onClick }) => {
  const locale = useContext(AppContext);
  const { namespace } = locale;

  return (
    <div className={`${namespace}-grid`}>
      {
        list.map(itm => {
          let icon;
          let active;
          let disabled;
          let activeState;

          if (itm !== null) {
            icon = 'arrow_right';
            if (itm === value) {
              active = true;
              activeState = true;
            }
          } else {
            disabled = true;
          }

          return (
            <span
              key={`${namespace}-grid-${itm}`}
              className={`${namespace}-grid-itm`}
            >
              <Button
                type="grid"
                icon={icon}
                active={active}
                disabled={disabled}
                activeState={activeState}
                onClick={itm !== null ? () => onClick(itm) : null}
              />
            </span>
          );
        })
      }
    </div>
  );
};

export default Grid;

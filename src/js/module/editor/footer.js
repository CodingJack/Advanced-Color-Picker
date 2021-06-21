import React from 'react';
import Button from '../../components/buttons/button';
import UserInput from './footer/user-input';

import {
  AppContext,
} from '../../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc the main footer for the editor which includes the save button and also the user input field
 * @since 1.0.0
*/
const Footer = ({ clearLayers, onClearGradient }) => {
  const locale = useContext(AppContext);
  const { namespace, onSave } = locale;

  return (
    <div className={`${namespace}-footer`}>
      <Button
        activeDisabled
        type="large"
        icon="palette"
      />
      <UserInput />
      <Button
        activeState
        type="large"
        icon="check"
        color="green"
        onClick={onSave}
      />
      {clearLayers && (
        <Button
          type="large"
          icon="layers_clear"
          onClick={onClearGradient}
          className={`${namespace}-clear-gradient`}
        />
      )}
    </div>
  );
};

export default memo(Footer);

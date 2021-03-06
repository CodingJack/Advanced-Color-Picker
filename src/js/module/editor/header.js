import React from 'react';
import Strip from './header/strip';
import Button from '../../components/buttons/button';

import {
  AppContext,
} from '../../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc the main header for the editor which includes the close button and also the preview strip
 * @since 1.0.0
*/
const Header = ({ showHidePreview }) => {
  const locale = useContext(AppContext);
  const { namespace, colorMode, onCancel } = locale;

  return (
    <div className={`${namespace}-header`}>
      <Button
        type="large"
        icon="close"
        color="red"
        onClick={onCancel}
      />
      <Strip />
      {colorMode !== 'single' && (
        <Button
          type="large"
          icon="launch"
          onClick={() => showHidePreview(true)}
        />
      )}
      {colorMode === 'single' && (
        <Button
          activeDisabled
          type="large"
          icon="invert_colors"
        />
      )}
    </div>
  );
};

export default memo(Header);
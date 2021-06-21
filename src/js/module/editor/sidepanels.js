import React from 'react';
import Presets from './presets';
import Preview from './sidepanels/preview';
import Hints from './sidepanels/hints';

import {
  AppContext,
} from '../../context';

const {
  memo,
  useContext,
} = React;

/*
 * @desc holder for the editor's 4 sidepanels, only shown when the editor is in "full" mode (colors + gradients)
 * @since 1.0.0
*/
const SidePanels = () => {
  const locale = useContext(AppContext);
  const { namespace } = locale;

  return (
    <>
      <div className={`${namespace}-sidepanels ${namespace}-sidepanel-left`}>
        <div className={`${namespace}-sidepanel ${namespace}-presets ${namespace}-preset-gradients`}>
          <Presets type="gradient" />
        </div>
        <div className={`${namespace}-sidepanel ${namespace}-presets ${namespace}-preset-colors`}>
          <Presets type="color" columns={5} minRows={5} />
        </div>
      </div>
      <div className={`${namespace}-sidepanels ${namespace}-sidepanel-right`}>
        <div className={`${namespace}-sidepanel`}>
          <Preview />
        </div>
        <div className={`${namespace}-sidepanel ${namespace}-with-pairs`}>
          <Hints />
        </div>
      </div>
    </>
  );
};

export default memo(SidePanels);
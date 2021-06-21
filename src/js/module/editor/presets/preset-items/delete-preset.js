import React from 'react';
import Button from '../../../../components/buttons/button';

const {
  memo,
} = React;

/*
 * @desc the "delete preset button" displayed underneath the custom presets
 * @since 1.0.0
*/
const DeletePreset = ({ index, type, disabled, callback }) => {
  const onDelete = () => {
    const view = type.charAt(0).toUpperCase() + type.slice(1);
    if (window.confirm(`Delete this Saved ${view}?`)) {
      callback(type, index);
    }
  }

  return (
    <Button
      type="long"
      label="Delete Preset"
      onClick={onDelete}
      disabled={disabled}
    >
    </Button>
  );
};

export default memo(DeletePreset);
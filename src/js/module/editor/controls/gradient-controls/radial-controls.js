import React from 'react';
import InputField from '../../../../components/inputs/input-field';
import Row from '../../../../components/wrappers/row';

import {
  AppContext,
} from '../../../../context';

import {
  maxPositionPixels,
} from '../../../../data/defaults';

const {
  memo,
  useContext,
} = React;

/*
 * @desc displays the "width" and "height" controls for 
 *       when "size" is selected as the shape for a radial gradient
 * @since 1.0.0
*/
const RadialControls = ({
  labels,
  className,
  value: data,
  prop: gradientProp,
  onChange: callback,
}) => {
  const appContext = useContext(AppContext);
  const { namespace } = appContext;

  const { x, y } = data;
  const { value: valueX, unit: unitX } = x;
  const { value: valueY, unit: unitY } = y;

  const maxX = unitX === '%' ? 100 : maxPositionPixels;
  const maxY = unitY === '%' ? 100 : maxPositionPixels;

  const onChangeValue = (value, prop) => {
    data[prop].value = value;
    callback({ ...data }, gradientProp);
  };

  const onChangeUnit = (value, prop) => {
    data[prop].unit = value;
    callback({ ...data }, gradientProp);
  };

  return (
    <div className={className}>
      <Row className={`${namespace}-row-input`}>
        <InputField
          slider
          prop="x"
          label={labels[0]}
          value={valueX}
          unit={unitX}
          max={maxX}
          onChange={onChangeValue}
          onChangeUnit={onChangeUnit}
        />
      </Row>
      <Row className={`${namespace}-row-input ${namespace}-row-input-last`}>
        <InputField
          slider
          prop="y"
          label={labels[1]}
          value={valueY}
          unit={unitY}
          max={maxY}
          onChange={onChangeValue}
          onChangeUnit={onChangeUnit}
        />
      </Row>
    </div>
  );
};

export default memo(RadialControls);
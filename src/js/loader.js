import React from 'react';

import {
  AppContext,
} from './context';

const {
  Component,
} = React;

/*
 * @desc loads the additional .js chunks when the widget is first opened
 * @since 1.0.0
*/
class Loader extends Component {
  constructor() {
    super(...arguments);
  }

  state = {
    Module: null,
  }

  async componentDidMount() {
    const { resolve } = this.props;
    const { default: Module } = await resolve();

    this.setState({ Module });
  }

  render() {
    const { namespace } = this.context;
    const { Module } = this.state;

    if (!Module) {
      return <span className={`${namespace}-preloader`} ><span>cache</span></span>;
    }

    return <Module {...this.props} />;
  }
}

Loader.contextType = AppContext;

export default Loader;

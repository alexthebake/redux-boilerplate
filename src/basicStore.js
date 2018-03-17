import { bindActionCreators } from 'redux';
import createReducer from './createReducer';

export default class BasicStore {
  constructor({
    initialState,
    actions
  }) {
    this.initialState = initialState;
    this.actions = actions;
  }

  get actionCreators() {
    let actionCreators = {};
    _.forEach(this.actions, ({ action }, name) => {
      actionCreators[name] = action;
    });
    return actionCreators;
  }

  get actionHandlers() {
    let actionHandlers = {};
    _.forEach(this.actions, ({ reducers }, name) => {
      actionHandlers = { ...actionHandlers, ...reducers };
    });
    return actionHandlers;
  }

  bindActionCreators(dispatch) {
    return bindActionCreators(this.actionCreators, dispatch);
  }

  createReducer() {
    return createReducer(this.initialState, this.actionHandlers);
  }
}

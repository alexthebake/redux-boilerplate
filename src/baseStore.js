import { bindActionCreators } from 'redux';
import createReducer from './createReducer';

export default class BaseStore {
  constructor({ name, initialState, actions = {} }) {
    this.name = name;
    this.initialState = initialState;
    this.rootActionCreator = null;
    this.actions = {};
    _.forEach(actions, (actionConfig, actionName) => {
      if (!_.has(actionConfig, 'action')) return;
      this.addBaseAction({
        name: actionName,
        ...actionConfig,
      });
    });
  }

  get actionCreators() {
    const actionCreators = {};
    _.forEach(this.actions, ({ action }, name) => {
      actionCreators[name] = action;
    });
    return actionCreators;
  }

  get actionHandlers() {
    let actionHandlers = {};
    _.forEach(this.actions, ({ reducers }) => {
      if (_.isEmpty(reducers)) return;
      actionHandlers = { ...actionHandlers, ...reducers };
    });
    return actionHandlers;
  }

  bindActionCreators(dispatch) {
    const boundActions = bindActionCreators(this.actionCreators, dispatch);
    if (_.isNull(this.rootActionCreator)) return boundActions;
    const boundRootAction = (...args) => dispatch(this.rootActionCreator(...args));
    return _.assign(boundRootAction, boundActions);
  }

  createReducer() {
    return createReducer(this.initialState, this.actionHandlers);
  }

  addBaseAction({ name, action, reducers = {} }) {
    this.actions[name] = { action, reducers };
  }
}

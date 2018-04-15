import { bindActionCreators } from 'redux';
import createReducer from './createReducer';

/**
 * BaseStore provides all the boilerplate for creating actions and reducers
 * with some initial state.
 * @param {string} options.name         Name of store
 * @param {*}      options.initialState Initial state for store
 * @param {object} [options.actions={}] Actions to initialize with store
 */
export default class BaseStore {
  constructor({ name, initialState, actions = {} }) {
    this.name = name;
    this.initialState = initialState;
    this.rootActionCreator = null;
    this.actions = {};
    this.defineBaseActions(actions);
  }

  /**
   * Maps action names to action creators.
   * @example
   * store.actionCreators
   * // returns { increment: () => ({ type: 'INCREMENT' }) }
   * @return {object} Action creators
   */
  get actionCreators() {
    const actionCreators = {};
    _.forEach(this.actions, ({ action }, name) => {
      actionCreators[name] = action;
    });
    return actionCreators;
  }

  /**
   * Maps action types to reducer functions.
   * @example
   * store.actionHandlers
   * // returns { INCREMENT: state => state + 1 }
   * @return {object} Action handlers
   */
  get actionHandlers() {
    let actionHandlers = {};
    _.forEach(this.actions, ({ reducers }) => {
      if (_.isEmpty(reducers)) return;
      actionHandlers = { ...actionHandlers, ...reducers };
    });
    return actionHandlers;
  }

  /**
   * Maps action names to action creators bound to dispatch.
   * @param   {function} dispatch Redux dispatch function
   * @returns {object}            Bound action creators
   */
  bindActionCreators(dispatch) {
    const boundActions = bindActionCreators(this.actionCreators, dispatch);
    if (_.isNull(this.rootActionCreator)) return boundActions;
    const boundRootAction = (...args) => dispatch(this.rootActionCreator(...args));
    return _.assign(boundRootAction, boundActions);
  }

  /**
   * Creates root reducer for action handlers.
   * @returns {function} Store reducer function
   */
  createReducer() {
    return createReducer(this.initialState, this.actionHandlers);
  }

  /**
   * Adds actions and reducers to store actions.
   * @param {string}   options.name          Name of action
   * @param {function} options.action        Action creator
   * @param {object}   [options.reducers={}] Reducers to handle action
   */
  addBaseAction({ name, action, reducers = {} }) {
    this.actions[name] = { action, reducers };
  }

  /**
   * Adds baseActions for any actionConfig with an action creator
   * @param {object} actions Action configs
   */
  defineBaseActions(actions) {
    _.forEach(actions, (config, name) => {
      if (!_.has(config, 'action')) return;
      this.addBaseAction({ name, ...config });
    });
  }
}

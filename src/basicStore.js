import { bindActionCreators } from 'redux';
import createReducer from './createReducer';
import { actionName } from './actionTypes';

function normalizeArgs(args) {
  if (args.length === 0) return undefined;
  if (args.length === 1) return args[0];
  return args;
}

export default class BasicStore {
  constructor({ name, initialState, actions = {} }) {
    this.name = name;
    this.initialState = initialState;
    this.actions = {};
    _.forEach(actions, (config, name) => {
      if (!config.reducer) return;
      this.addAction({ name, ...config });
    });
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
      if (_.isEmpty(reducers)) return;
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

  addAction({
    name,
    payload,
    reducer,
  }) {
    const actionType = actionName(this.name, name);
    this.actions[name] = {
      action: (...args) => {
        let finalPayload = payload;
        if (_.isUndefined(payload)) {
          finalPayload = normalizeArgs(args);
        } else if (_.isFunction(payload)) {
          finalPayload = payload(...args);
        }
        return {
          type: actionType,
          payload: finalPayload,
        }
      },
      reducers: { [actionType]: reducer }
    };
  }
}

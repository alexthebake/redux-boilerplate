import BaseStore from './baseStore';
import * as actionTypes from './actionTypes';

export default class BasicStore extends BaseStore {
  constructor({ name, initialState, actions = {} }) {
    super({ name, initialState, actions });
    _.forEach(actions, (actionConfig, actionName) => {
      if (_.isFunction(actionConfig)) {
        this.addAction({
          name: actionName,
          updater: actionConfig,
        });
      }
      if (_.isFunction(actionConfig.thunk)) {
        this.addThunkAction({
          name: actionName,
          ...actionConfig,
        });
      }
    });
  }

  addAction({ name, updater }) {
    const actionType = actionTypes.actionName(this.name, name);
    this.addBaseAction({
      name,
      action: (...args) => ({ type: actionType, payload: args }),
      reducers: {
        [actionType]: (state, action) => updater(state, ...action.payload),
      },
    });
  }

  addThunkAction({ name, thunk }) {
    this.addBaseAction({
      name,
      action: (...args) => (dispatch, getState) => {
        const actions = this.bindActionCreators(dispatch);
        return thunk(...args)(actions, getState);
      },
    });
  }
}

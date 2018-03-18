import { bindActionCreators } from 'redux';
import createReducer from './createReducer';
import { actionName } from './actionTypes';

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
        return {
          type: actionType,
          payload: _.isFunction(payload)
            ? payload(...args)
            : payload,
        }
      },
      reducers: { [actionType]: reducer }
    };
  }
}

// const counterStore = new BasicStore({
//   name: 'counter',
//   initialState: { counter: 0 },
//   actions: {
//     increment: {
//       payload: (i = 1) => i,
//       reducer: (state, action) => ({
//         ...state,
//         counter: state.counter + action.payload,
//       }),
//     },
//   },
// });

// const resourceStore = new ThunkStore({
//   name: 'resource',
//   initialState: {
//     loaded: false,
//     loading: false,
//     data: null,
//     error: null,
//   },
//   actions: {
//     indexLoading: {
//       payload: (id) => id,
//       reducer: (state, action) => ({
//         ...state,
//         loading: true
//       }),
//     },
//     indexSuccess: {
//       payload: (data) => data,
//       reducer: (state, action) => ({
//         ...state,
//         loaded: true,
//         loading: false,
//         data: action.payload,
//       }),
//     },
//     indexFailure: {
//       payload: (error) => error,
//       reducer: (state, action) => ({
//         ...state,
//         loaded: true,
//         loading: false,
//         error: action.payload
//       }),
//     },
//     index: {
//       thunk: (id) => (actions) => (dispatch) => {
//         actions.indexLoading(id);
//         return axios.get('/api/resource/')
//           .then(response => {
//             actions.indexSuccess(response);
//             return response;
//           })
//           .catch(error => {
//             actions.indexFailure(error);
//             return error;
//           });
//       }
//     }
//   },
// });



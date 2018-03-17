import axios from 'axios';
import ThunkStore from './thunkStore';
import { promiseActionType } from './actionTypes';
import { setupAxiosActionCreator } from './axiosActionCreator';
import { AJAX_INITIAL_STATE } from './constants';
import { mergeConfigs } from './utils';
import { actionName } from './actionTypes';

function defaultDataUpdater(state, action) {
  return action.payload.data;
}

export function setupAxiosStore(config) {
  return class _AxiosStore extends AxiosStore {
    constructor(args) {
      super(mergeConfigs(args, config));
    }
  }
}

export default class AxiosStore extends ThunkStore {
  constructor({ name, actions = {}, config = {} }) {
    super({
      name,
      initialState: AJAX_INITIAL_STATE,
    });
    // this.axiosActionCreator = setupAxiosActionCreator(config);
    this.axiosConfig = config;
    _.forEach(actions, (config, name) => {
      if (!config.request) return;
      this.addAxiosAction({ name, ...config });
    });
  }

  addAxiosAction({ name, request, dataUpdater = defaultDataUpdater }) {
    const actionType = promiseActionType(name);
    this.addAction({
      name: actionType.LOADING,
      payload: (id) => id,
      reducer: (state, action) => ({
        ...state,
        loading: true
      }),
    });
    this.addAction({
      name: actionType.SUCCESS,
      payload: (data) => data,
      reducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        data: dataUpdater(state, action),
      }),
    });
    this.addAction({
      name: actionType.FAILURE,
      payload: (error) => error,
      reducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        error: action.payload
      }),
    });
    this.addThunkAction({
      name,
      thunk: (args) => (actions) => (dispatch) => {
        const requestConfig = _.isFunction(request)
          ? request(args)
          : request;
        dispatch(actions[actionType.LOADING](args));
        return axios.request({ ...requestConfig, ...this.axiosConfig })
          .then(response => {
            dispatch(actions[actionType.SUCCESS](response));
            return response;
          })
          .catch(error => {
            dispatch(actions[actionType.FAILURE](error));
            return error;
          });
      }
    });
  }
}

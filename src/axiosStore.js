import axios from 'axios';
import requestKey from './requestKey';
import PromiseStore from './promiseStore';
import { AJAX_INITIAL_STATE } from './constants';
import { mergeConfigs } from './utils';
import { actionName } from './actionTypes';

function defaultDataUpdater(state) {
  return state.data;
}

function updatedRequests(state, action) {
  const { context } = action;
  const { key } = context;
  const cachedRequest = state.requests[key];
  if (_.isUndefined(cachedRequest)) {
    return { ...state.requests, [key]: context };
  }
  return {
    ...state.requests,
    [key]: { ...cachedRequest, ...context }
  };
}

export function setupAxiosStore(config) {
  return class _AxiosStore extends AxiosStore {
    constructor(args) {
      super(mergeConfigs(args, config));
    }
  }
}

export default class AxiosStore extends PromiseStore {
  constructor({ name, actions = {}, config = {} }) {
    super({
      name,
      actions,
      initialState: AJAX_INITIAL_STATE,
    });
    this.axiosConfig = config;
    _.forEach(actions, (config, name) => {
      if (!config.request) return;
      this.addAxiosAction({ name, ...config });
    });
  }

  addAxiosAction({
    name,
    request,
    dataUpdater = defaultDataUpdater,
    success = (args) => args,
    failure = (args) => args,
  }) {
    const getRequestConfig = (args, request) => {
      return _.isFunction(request) ? request(...args) : request;
    }
    this.addPromiseAction({
      name,
      promiseCallback: (...args) => {
        const requestConfig = getRequestConfig(args, request);
        return axios.request({ ...requestConfig, ...this.axiosConfig })
          .then(success)
          .catch(failure)
      },
      loadingContext: (promise, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'loading',
        promise,
      }),
      successContext: (response, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'success',
        response,
      }),
      failureContext: (response, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'failure',
        response,
      }),
      loadingReducer: (state, action) => ({
        ...state,
        loading: true,
        requests: updatedRequests(state, action),
      }),
      successReducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        data: dataUpdater(state, action),
        requests: updatedRequests(state, action),
      }),
      failureReducer: (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        error: action.payload,
        requests: updatedRequests(state, action),
      }),
    })
  }
}

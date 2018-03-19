import axios from 'axios';
import requestKey from './requestKey';
import PromiseStore from './promiseStore';
import { AJAX_INITIAL_STATE } from './constants';
import { mergeConfigs } from './utils';
import { actionName } from './actionTypes';

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

function defaultDataUpdater(state) {
  return state.data;
}

export function defaultReducer(status, dataUpdater) {
  switch (status) {
    case 'loading':
      return (state, action) => ({
        ...state,
        loading: true,
        requests: updatedRequests(state, action),
      });
    case 'success':
      return (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        data: dataUpdater(state, action),
        requests: updatedRequests(state, action),
      });
    case 'failure':
      return (state, action) => ({
        ...state,
        loaded: true,
        loading: false,
        error: action.payload,
        requests: updatedRequests(state, action),
      });
    default:
      return (state) => ({ ...state });
  }
}

class AxiosStore extends PromiseStore {
  constructor({
    name,
    actions = {},
    config = {},
    primaryKey = 'id',
  }) {
    super({
      name,
      actions,
      initialState: AJAX_INITIAL_STATE,
    });
    this.config = config;
    this.primaryKey = primaryKey;
    _.forEach(actions, (config, name) => {
      if (!config.request) return;
      this.addAxiosAction({ name, ...config });
    });
  }

  get axiosConfig() {
    return { ...AxiosStore.config, ...this.config };
  }

  addAxiosAction({
    name,
    request,
    dataUpdater = defaultDataUpdater,
    loadingReducer,
    successReducer,
    failureReducer,
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
      loadingReducer: _.isFunction(loadingReducer)
        ? loadingReducer
        : defaultReducer('loading'),
      successReducer: _.isFunction(successReducer)
        ? successReducer
        : defaultReducer('success', (state, action) =>
            dataUpdater(state, action, this.primaryKey)
          ),
      failureReducer: _.isFunction(failureReducer)
        ? failureReducer
        : defaultReducer('failure'),
    })
  }
}

AxiosStore.config = {};
AxiosStore.setConfig = (config) => {
  AxiosStore.config = config
};

export default AxiosStore;

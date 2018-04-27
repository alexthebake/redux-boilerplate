import axios from 'axios';
import requestKey from './requestKey';
import PromiseStore from './promiseStore';
import { AJAX_INITIAL_STATE, PROMISE_STATUS } from './constants';

/**
 * Calculates final request config
 * @param {array}           args    Arguments passed into thunk action
 * @param {object|function} request Request object or function
 */
function getRequestConfig(args, request) {
  return _.isFunction(request)
    ? request(...args)
    : request;
}

/**
 * Calculates new request cache state
 * @param {object} state   Current store state
 * @param {object} context Incoming context object
 */
function updatedRequests(state, context) {
  const { key } = context;
  const cachedRequest = state.requests[key];
  if (_.isUndefined(cachedRequest)) {
    return { ...state.requests, [key]: context };
  }
  return {
    ...state.requests,
    [key]: { ...cachedRequest, ...context },
  };
}

/**
 * Default data updater that does not change the data state
 * @param {object} state Current store state
 */
function defaultDataUpdater(state) {
  return state.data;
}

/**
 * Default success handler which merely passes along the resolved data
 * @param {array} args Arguments passed to resolved promise
 */
function defaultSuccessHandler(args) {
  return args;
}

/**
 * Default failure handler which merely passes along the rejected data
 * @param {array} args Arguments passed to rejected promise
 */
function defaultFailureHandler(args) {
  return args;
}

/**
 * Standard axios loading updater with request cache
 */
export function axiosLoadingUpdater() {
  return (state, context) => ({
    ...state,
    loading: true,
    requests: updatedRequests(state, context),
  });
}

/**
 * Standard axios success updater with request cache
 * @param {function} dataUpdater Data updater to apply to store data
 */
export function axiosSuccessUpdater(dataUpdater) {
  return (state, response, context) => ({
    ...state,
    loaded: true,
    loading: false,
    data: dataUpdater(state, response),
    requests: updatedRequests(state, context),
  });
}

/**
 * Standard axios failure updater with request cache
 */
export function axiosFailureUpdater() {
  return (state, error, context) => ({
    ...state,
    loaded: true,
    loading: false,
    error,
    requests: updatedRequests(state, context),
  });
}

/**
 * Calculates axios updaters based on promise status
 * @param {string}   status      Promise status
 * @param {function} dataUpdater Data updater to apply to store data on success
 */
export function defaultAxiosUpdater(status, dataUpdater) {
  switch (status) {
    case PROMISE_STATUS.LOADING:
      return axiosLoadingUpdater();
    case PROMISE_STATUS.SUCCESS:
      return axiosSuccessUpdater(dataUpdater);
    case PROMISE_STATUS.FAILURE:
      return axiosFailureUpdater();
    default:
      return state => ({ ...state });
  }
}

/**
 * Standard axios loading context to pass around for request cache
 * @param {object|function} request Request object or function
 */
export function axiosLoadingContext(request) {
  return (promise, ...args) => ({
    key: requestKey(getRequestConfig(args, request)),
    status: 'loading',
    startTime: new Date(),
    promise,
    args,
  });
}

/**
 * Standard axios success context to pass around for request cache
 * @param {object|function} request Request object or function
 */
export function axiosSuccessContext(request) {
  return (response, ...args) => ({
    key: requestKey(getRequestConfig(args, request)),
    status: 'success',
    endTime: new Date(),
    response,
    args,
  });
}

/**
 * Standard axios failure context to pass around for request cache
 * @param {object|function} request Request object or function
 */
export function axiosFailureContext(request) {
  return (response, ...args) => ({
    key: requestKey(getRequestConfig(args, request)),
    status: 'failure',
    endTime: new Date(),
    response,
    args,
  });
}

/**
 * Calculates axios context based on promise status
 * @param {string}          status  Promise status
 * @param {object|function} request Request object or function
 */
export function defaultAxiosContext(status, request) {
  switch (status) {
    case PROMISE_STATUS.LOADING:
      return axiosLoadingContext(request);
    case PROMISE_STATUS.SUCCESS:
      return axiosSuccessContext(request);
    case PROMISE_STATUS.FAILURE:
      return axiosFailureContext(request);
    default:
      return state => ({ ...state });
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
    _.forEach(actions, (actionConfig, actionName) => {
      if (!actionConfig.request) return;
      this.addAxiosAction({
        name: actionName,
        ...actionConfig,
      });
    });
  }

  get axiosConfig() {
    return { ...AxiosStore.config, ...this.config };
  }

  addAxiosAction({
    name,
    request,
    dataUpdater = defaultDataUpdater,
    success = defaultSuccessHandler,
    failure = defaultFailureHandler,
    loadingUpdater,
    successUpdater,
    failureUpdater,
  }) {
    const pkDataUpdater = (state, response) => dataUpdater(state, response, this.primaryKey);
    this.addPromiseAction({
      name,
      promiseCallback: (...args) => {
        const requestConfig = getRequestConfig(args, request);
        return axios.request({ ...this.axiosConfig, ...requestConfig })
          .then(success)
          .catch(failure);
      },
      loadingContext: defaultAxiosContext(PROMISE_STATUS.LOADING, request),
      successContext: defaultAxiosContext(PROMISE_STATUS.SUCCESS, request),
      failureContext: defaultAxiosContext(PROMISE_STATUS.FAILURE, request),
      loadingUpdater: _.isFunction(loadingUpdater)
        ? loadingUpdater
        : defaultAxiosUpdater(PROMISE_STATUS.LOADING),
      successUpdater: _.isFunction(successUpdater)
        ? successUpdater
        : defaultAxiosUpdater(PROMISE_STATUS.SUCCESS, pkDataUpdater),
      failureUpdater: _.isFunction(failureUpdater)
        ? failureUpdater
        : defaultAxiosUpdater(PROMISE_STATUS.FAILURE),
    });
  }
}

AxiosStore.config = {};
/**
 * Globally sets axios config on AxiosStore requests
 * @param {object} config New config to apply to axios requests
 */
AxiosStore.setConfig = (config) => {
  AxiosStore.config = config;
};

export default AxiosStore;

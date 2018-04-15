import axios from 'axios';
import requestKey from './requestKey';
import PromiseStore from './promiseStore';
import { AJAX_INITIAL_STATE } from './constants';

function getRequestConfig(args, request) {
  return _.isFunction(request)
    ? request(...args)
    : request;
}

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

function defaultDataUpdater(state) {
  return state.data;
}

export function axiosLoadingUpdater() {
  return (state, context) => ({
    ...state,
    loading: true,
    requests: updatedRequests(state, context),
  });
}

export function axiosSuccessUpdater(dataUpdater) {
  return (state, response, context) => ({
    ...state,
    loaded: true,
    loading: false,
    data: dataUpdater(state, response),
    requests: updatedRequests(state, context),
  });
}

export function axiosFailureUpdater() {
  return (state, error, context) => ({
    ...state,
    loaded: true,
    loading: false,
    error,
    requests: updatedRequests(state, context),
  });
}

export function defaultUpdater(status, dataUpdater) {
  switch (status) {
    case 'loading':
      return axiosLoadingUpdater();
    case 'success':
      return axiosSuccessUpdater(dataUpdater);
    case 'failure':
      return axiosFailureUpdater();
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
    success = args => args,
    failure = args => args,
    loadingUpdater,
    successUpdater,
    failureUpdater,
  }) {
    this.addPromiseAction({
      name,
      promiseCallback: (...args) => {
        const requestConfig = getRequestConfig(args, request);
        return axios.request({ ...this.axiosConfig, ...requestConfig })
          .then((response) => {
            if (response.statusText === 'OK') {
              return success(response);
            }
            return Promise.reject(response);
          }).catch(error => Promise.reject(failure(error)));
      },
      loadingContext: (promise, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'loading',
        startTime: new Date(),
        promise,
        args,
      }),
      successContext: (response, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'success',
        endTime: new Date(),
        response,
        args,
      }),
      failureContext: (response, ...args) => ({
        key: requestKey(getRequestConfig(args, request)),
        status: 'failure',
        endTime: new Date(),
        response,
        args,
      }),
      loadingUpdater: _.isFunction(loadingUpdater)
        ? loadingUpdater
        : defaultUpdater('loading'),
      successUpdater: _.isFunction(successUpdater)
        ? successUpdater
        : defaultUpdater('success', (state, response) =>
          dataUpdater(state, response, this.primaryKey)),
      failureUpdater: _.isFunction(failureUpdater)
        ? failureUpdater
        : defaultUpdater('failure'),
    });
  }
}

AxiosStore.config = {};
AxiosStore.setConfig = (config) => {
  AxiosStore.config = config;
};

export default AxiosStore;

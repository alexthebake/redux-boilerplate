import axios from 'axios';
import requestKey from './requestKey';
import AxiosStore, { defaultReducer } from './axiosStore';
import { mergeConfigs } from './utils';
import {
  unionById,
  removeById,
  addOrUpdateById
} from './dataUpdaters';
import { AJAX_INITIAL_STATE } from './constants';

function getPreviousRequest(
  resourceState,
  { url, data = {}, method = "GET" }
) {
  if (_.isUndefined(resourceState)) return;
  const { requests } = resourceState;
  if (_.isUndefined(requests)) return;
  const key = requestKey({ url, data, method });
  return requests[key];
}

function resourceResponse(status, statusText, data) {
  return Promise.resolve({ status, statusText, data });
}

function axiosToResourceResponse(axiosResponse) {
  const { status, statusText, data } = axiosResponse;
  return resourceResponse(status, statusText, data);
}

export default class ResourceStore extends AxiosStore {
  constructor({
    name,
    endpoint,
    actions = {},
    config = {},
    primaryKey = 'id',
    parent = undefined
  }) {
    super({ name, config, actions, primaryKey });
    this.endpoint = endpoint;
    this.parent = parent;
    this.nestedId = null;
    this.nestedStores = {};
    this.defineActions();
  }

  defineActions() {
    this.defineIndexActions();
    this.defineShowActions();
    this.defineUpdateActions();
    this.defineCreateActions();
    this.defineDeleteActions();
    this.defineOptionsActions();
  }

  defineIndexActions() {
    this.addAxiosAction({
      name: 'forceIndex',
      request: (query = {}) => ({
        url: this.getEndpoint(),
        data: query,
      }),
      success: axiosToResourceResponse,
      ...this.handleStateUpdate(unionById),
    });
    this.addThunkAction({
      name: 'index',
      thunk: (query = {}) => (actions) => (dispatch, getState) => {
        const resourceState = this.getResourceState(getState());
        const previousRequest = getPreviousRequest(resourceState, {
          url: this.getEndpoint(),
          data: query
        });
        switch (_.get(previousRequest, "status")) {
          case "loading":
            return previousRequest.promise.then(axiosToResourceResponse);
          case "success":
            // It's possible that the data we successfully fetched before has been
            // updated. To avoid returning stale data, we grab the ids from the
            // previous request and get the latest resource objects.
            const data = _.map(
              previousRequest.response.data,
              ({ id }) => resourceState.data[id],
            );
            return resourceResponse(200, data);
          default:
            return dispatch(actions.forceIndex(query));
        }
      },
    });
  }

  defineShowActions() {
    this.addAxiosAction({
      name: 'forceShow',
      request: (id) => ({
        url: `${this.getEndpoint()}${id}`
      }),
      success: axiosToResourceResponse,
      ...this.handleStateUpdate(addOrUpdateById),
    });
    this.addThunkAction({
      name: 'show',
      thunk: (id) => (actions) => (dispatch, getState) => {
        const resourceState = this.getResourceState(getState());
        // It's possible that the resource may already be in the store, even if a
        // show request for `id` hasn't yet been made. If it's already present, we
        // can avoid making another request and simply return it from the store.
        const resource = _.get(resourceState, `data[${id}]`);
        if (!_.isUndefined(resource)) {
          return resourceResponse(200, resource);
        }

        const previousRequest = getPreviousRequest(resourceState, {
          url: `${this.getEndpoint()}${id}`
        });
        switch (_.get(previousRequest, "status")) {
          case "loading":
            return previousRequest.promise.then(axiosToResourceResponse);
          default:
            return dispatch(actions.forceShow(id));
        }
      },
    });
  }

  defineCreateActions() {
    this.addAxiosAction({
      name: 'create',
      request: (params = {}) => ({
        url: this.getEndpoint(),
        data: params,
        method: 'POST',
      }),
      success: axiosToResourceResponse,
      ...this.handleStateUpdate(addOrUpdateById),
    });
  }

  defineUpdateActions() {
    this.addAxiosAction({
      name: 'update',
      request: (id, updates = {}) => ({
        url: `${this.getEndpoint()}${id}`,
        data: updates,
        method: 'PUT',
      }),
      success: axiosToResourceResponse,
      ...this.handleStateUpdate(addOrUpdateById),
    });
  }

  defineDeleteActions() {
    this.addAxiosAction({
      name: 'delete',
      request: (id) => ({
        url: `${this.getEndpoint()}${id}`,
        method: 'DELETE'
      }),
      success: axiosToResourceResponse,
      ...this.handleStateUpdate(removeById),
    });
  }

  defineOptionsActions() {
    // TODO: Try axiosAction with successReducer
    this.addPromiseAction({
      name: 'options',
      promiseCallback: () => axios.request({
        url: this.getEndpoint(),
        method: 'OPTIONS',
        ...this.axiosConfig,
      }),
      successReducer: (state, action) => ({
        ...state,
        options: action.payload.data,
      }),
    });
  }

  injectNestedId(id) {
    this.nestedId = id;
  }

  getRootStore() {
    return !this.parent
      ? this
      : this.parent.getRootStore();
  }

  getEndpoint() {
    if (!this.parent) return this.endpoint;
    return _.isFunction(this.endpoint)
      ? this.endpoint(this.nestedId)
      : this.endpoint;
  }

  getResourceState(state) {
    const resourcePath = this.nestedId
      ? `${this.getRootStore().name}.${this.getNestedStatePath()}`
      : this.name;
    const resourceState = _.get(state, resourcePath);
    return resourceState;
  }

  getNestedStatePath(path = []) {
    // TODO: Figure out a more robust way to do this.
    if (!this.parent) return path.join('.');
    const thisName = _.last(this.name.split('.'));
    return this.parent.getNestedStatePath([
      thisName, this.nestedId, ...path
    ]);
  }

  handleStateUpdate(dataUpdater) {
    const pkDataUpdater = (state, action) =>
      dataUpdater(state.data, action.payload.data, this.primaryKey);
    if (!this.parent) {
      // For top level resources, the dataUpdater will suffice.
      return { dataUpdater: pkDataUpdater };
    }
    return {
      loadingReducer: (state, action) =>
        this.updateNestedState(state, action, 'loading'),
      successReducer: (state, action) =>
        this.updateNestedState(state, action, 'success', pkDataUpdater),
      failureReducer: (state, action) =>
        this.updateNestedState(state, action, 'failure'),
    };
  }

  updateNestedState(state, action, status, dataUpdater) {
    const newState = { ...state };
    const nestedPath = this.getNestedStatePath();
    const nestedState = {
      ...AJAX_INITIAL_STATE,
      ..._.get(newState, nestedPath, {}),
    };
    _.setWith(
      newState,
      nestedPath,
      defaultReducer(status, dataUpdater)(nestedState, action),
      Object
    );
    return newState;
  }

  addNestedActionHandlers(nestedStore) {
    const rootStore = this.getRootStore();
    _.forEach(nestedStore.actionHandlers, (reducer, name) => {
      rootStore.actions[name] = { reducers: { [name]: reducer } };
    });
  }

  addNestedResource({
    name,
    endpoint,
    primaryKey = 'id'
  }) {
    const nestedStore = new ResourceStore({
      parent: this,
      name: `${this.name}.${name}`,
      endpoint: id => `${this.getEndpoint()}${id}${endpoint}`,
      primaryKey
    });
    this.nestedStores[name] = nestedStore;
    this.addNestedActionHandlers(nestedStore)
    this.initialState = {
      ...this.initialState,
      [name]: {}
    };
    this.addThunkAction({
      name,
      thunk: (id) => (actions) => (dispatch) => {
        nestedStore.injectNestedId(id);
        return nestedStore.bindActionCreators(dispatch);
      }
    });
  }
}

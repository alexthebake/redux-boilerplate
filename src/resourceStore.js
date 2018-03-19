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
      request: (query = {}, _empty, ...nestedIds) => ({
        url: this.getEndpoint(nestedIds),
        data: query,
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(unionById),
    });
    this.addThunkAction({
      name: 'index',
      thunk: (query = {}, _empty, ...nestedIds) => (actions) => (dispatch, getState) => {
        const resourceState = this.getResourceState(getState(), nestedIds);
        const previousRequest = getPreviousRequest(resourceState, {
          url: this.getEndpoint(nestedIds),
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
            return dispatch(actions.forceIndex(query, undefined, ...nestedIds));
        }
      },
    });
  }

  defineShowActions() {
    this.addAxiosAction({
      name: 'forceShow',
      request: (id, _empty, ...nestedIds) => ({
        url: `${this.getEndpoint(nestedIds)}${id}`
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(addOrUpdateById),
    });
    this.addThunkAction({
      name: 'show',
      thunk: (id, _empty, ...nestedIds) => (actions) => (dispatch, getState) => {
        const resourceState = this.getResourceState(getState(), nestedIds);
        // It's possible that the resource may already be in the store, even if a
        // show request for `id` hasn't yet been made. If it's already present, we
        // can avoid making another request and simply return it from the store.
        const resource = _.get(resourceState, `data[${id}]`);
        if (!_.isUndefined(resource)) {
          return resourceResponse(200, resource);
        }

        const previousRequest = getPreviousRequest(resourceState, {
          url: `${this.getEndpoint(nestedIds)}${id}`
        });
        switch (_.get(previousRequest, "status")) {
          case "loading":
            return previousRequest.promise.then(axiosToResourceResponse);
          default:
            return dispatch(actions.forceShow(id, undefined, ...nestedIds));
        }
      },
    });
  }

  defineCreateActions() {
    this.addAxiosAction({
      name: 'create',
      request: (params = {}, _empty, ...nestedIds) => ({
        url: this.getEndpoint(nestedIds),
        data: params,
        method: 'POST',
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(addOrUpdateById),
    });
  }

  defineUpdateActions() {
    this.addAxiosAction({
      name: 'update',
      request: (id, updates = {}, nestedId) => ({
        url: `${this.getEndpoint(nestedIds)}${id}`,
        data: updates,
        method: 'PUT',
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(addOrUpdateById),
    });
  }

  defineDeleteActions() {
    this.addAxiosAction({
      name: 'delete',
      request: (id, _empty, ...nestedIds) => ({
        url: `${this.getEndpoint(nestedIds)}${id}`,
        method: 'DELETE'
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(removeById),
    });
  }

  defineOptionsActions() {
    this.addAxiosAction({
      name: 'options',
      request: (_empty1, _empty2, ...nestedIds) => ({
        url: this.getEndpoint(nestedIds),
        method: 'OPTIONS',
      }),
      successReducer: (state, action) => ({
        ...state,
        options: action.payload.data,
      }),
    });
  }

  getRootStore() {
    return !this.parent
      ? this
      : this.parent.getRootStore();
  }

  getEndpoint(nestedIds) {
    if (!this.parent) return this.endpoint;
    return _.isFunction(this.endpoint)
      ? this.endpoint(...nestedIds)
      : this.endpoint;
  }

  getResourceState(state, nestedIds) {
    const resourcePath = this.parent
      ? `${this.getRootStore().name}.${this.getNestedStatePath(nestedIds)}`
      : this.name;
    const resourceState = _.get(state, resourcePath);
    return resourceState;
  }

  getNestedStatePath(nestedIds, path = []) {
    // TODO: Figure out a more robust way to do this.
    if (!this.parent) return path.join('.');
    const thisName = _.last(this.name.split('.'));
    const nestedId = _.head(nestedIds);
    const remainingIds = _.tail(nestedIds);
    return this.parent.getNestedStatePath(
      remainingIds,
      [thisName, nestedId, ...path]
    );
  }

  resourceReducers(dataUpdater) {
    const pkDataUpdater = (state, action) =>
      dataUpdater(state.data, action.payload.data, this.primaryKey);
    if (!this.parent) {
      // For top level resources, just the dataUpdater will suffice.
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
    const nestedIds = _.slice(action.context.args, 2);
    const newState = { ...state };
    const nestedPath = this.getNestedStatePath(nestedIds);
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
      endpoint: (id, ...nestedIds) =>
        `${this.getEndpoint(nestedIds)}${id}${endpoint}`,
      primaryKey
    });
    this.nestedStores[name] = nestedStore;
    this.addNestedActionHandlers(nestedStore)
    this.addThunkAction({
      name,
      thunk: (id, _empty, ...nestedIds) => (actions) => (dispatch) => {
        const actionCreators = nestedStore.bindActionCreators(dispatch);
        let newActions = {};
        _.forEach(actionCreators, (action, name) => {
          newActions[name] = _.partialRight(action, _, _, id, ...nestedIds);
        });
        return newActions;
      }
    });
  }
}

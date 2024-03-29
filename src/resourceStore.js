import requestKey from './requestKey';
import AxiosStore, { defaultAxiosUpdater } from './axiosStore';
import {
  unionById,
  removeById,
  addOrUpdateById,
} from './dataUpdaters';
import { AJAX_INITIAL_STATE } from './constants';

const NUM_PLACEHOLDERS = 2;
const empty = _.times(NUM_PLACEHOLDERS, _.constant(_));

function getPreviousRequest(
  resourceState,
  { url, data = {}, method = 'GET' },
) {
  if (_.isUndefined(resourceState)) return null;
  const { requests } = resourceState;
  if (_.isUndefined(requests)) return null;
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
    parent = undefined,
  }) {
    super({
      name, config, actions, primaryKey,
    });
    this.endpoint = endpoint;
    this.parent = parent;
    this.nestedStores = {};
    this.defineActions();
    this.defineRootAction();
  }

  defineActions() {
    this.defineIndexActions();
    this.defineShowActions();
    this.defineUpdateActions();
    this.defineCreateActions();
    this.defineDeleteActions();
    this.defineOptionsActions();
  }

  defineRootAction() {
    this.rootActionCreator = (id, ...nestedIds) => (dispatch) => {
      const nestedActions = {};
      _.forEach(this.nestedStores, (store, name) => {
        const rootActionCreator = store.bindActionCreators(dispatch);
        const newActions = _.partialRight(rootActionCreator, ...empty, id, ...nestedIds);
        _.forEach(rootActionCreator, (action, actionName) => {
          newActions[actionName] = _.partialRight(action, ...empty, id, ...nestedIds);
        });
        nestedActions[name] = newActions;
      });
      return nestedActions;
    };
  }

  defineIndexActions() {
    this.addAxiosAction({
      name: 'forceIndex',
      request: (query = {}, ...nestedIds) => ({
        url: this.getEndpoint(nestedIds),
        data: query,
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(unionById),
    });
    this.addThunkAction({
      name: 'index',
      thunk: (query = {}, ...nestedIds) => (actions, getState) => {
        const resourceState = this.getResourceState(getState(), nestedIds);
        const previousRequest = getPreviousRequest(resourceState, {
          url: this.getEndpoint(nestedIds),
          data: query,
        });
        switch (_.get(previousRequest, 'status')) {
          case 'loading':
            return previousRequest.promise.then(axiosToResourceResponse);
          case 'success': // eslint-disable-line no-case-declarations
            // It's possible that the data we successfully fetched before has been
            // updated. To avoid returning stale data, we grab the ids from the
            // previous request and get the latest resource objects.
            const data = _.map(
              previousRequest.response.data,
              ({ id }) => resourceState.data[id],
            );
            return resourceResponse(200, data);
          default:
            return actions.forceIndex(query, undefined, ...nestedIds);
        }
      },
    });
  }

  defineShowActions() {
    this.addAxiosAction({
      name: 'forceShow',
      request: (id, ...nestedIds) => ({
        url: `${this.getEndpoint(nestedIds)}${id}/`,
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(addOrUpdateById),
    });
    this.addThunkAction({
      name: 'show',
      thunk: (id, ...nestedIds) => (actions, getState) => {
        const resourceState = this.getResourceState(getState(), nestedIds);
        // It's possible that the resource may already be in the store, even if a
        // show request for `id` hasn't yet been made. If it's already present, we
        // can avoid making another request and simply return it from the store.
        const resource = _.get(resourceState, `data[${id}]`);
        if (!_.isUndefined(resource)) {
          return resourceResponse(200, resource);
        }

        const previousRequest = getPreviousRequest(resourceState, {
          url: `${this.getEndpoint(nestedIds)}${id}`,
        });
        switch (_.get(previousRequest, 'status')) {
          case 'loading':
            return previousRequest.promise.then(axiosToResourceResponse);
          default:
            return actions.forceShow(id, undefined, ...nestedIds);
        }
      },
    });
  }

  defineCreateActions() {
    this.addAxiosAction({
      name: 'create',
      request: (params = {}, ...nestedIds) => ({
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
      request: (id, updates = {}, ...nestedIds) => ({
        url: `${this.getEndpoint(nestedIds)}${id}/`,
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
      request: (id, ...nestedIds) => ({
        url: `${this.getEndpoint(nestedIds)}${id}/`,
        method: 'DELETE',
      }),
      success: axiosToResourceResponse,
      ...this.resourceReducers(removeById),
    });
  }

  defineOptionsActions() {
    this.addAxiosAction({
      name: 'options',
      request: (...nestedIds) => ({
        url: this.getEndpoint(nestedIds),
        method: 'OPTIONS',
      }),
      successUpdater: (state, response) => ({
        ...state,
        loading: false,
        options: response.data,
      }),
    });
  }

  getRootStore() {
    return !this.parent
      ? this
      : this.parent.getRootStore();
  }

  getEndpoint(nestedIds) {
    return _.isFunction(this.endpoint)
      ? this.endpoint(..._.compact(nestedIds))
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
    const ids = _.compact(nestedIds);
    const thisName = _.last(this.name.split('.'));
    const nestedId = _.head(ids);
    const remainingIds = _.tail(ids);
    return this.parent.getNestedStatePath(
      remainingIds,
      [thisName, nestedId, ...path],
    );
  }

  resourceReducers(dataUpdater) {
    const pkDataUpdater = (state, response) =>
      dataUpdater(state.data, response.data, this.primaryKey);
    if (!this.parent) {
      // For top level resources, just the dataUpdater will suffice.
      return { dataUpdater: pkDataUpdater };
    }
    return {
      loadingUpdater: (state, context) =>
        this.updateNestedState({
          status: 'loading',
          state,
          context,
        }),
      successUpdater: (state, data, context) =>
        this.updateNestedState({
          status: 'success',
          state,
          data,
          context,
          dataUpdater: pkDataUpdater,
        }),
      failureUpdater: (state, data, context) =>
        this.updateNestedState({
          status: 'failure',
          state,
          data,
          context,
        }),
    };
  }

  updateNestedState({
    status,
    state,
    data = null,
    context = null,
    dataUpdater = null,
  }) {
    const nestedIds = _.slice(context.args, NUM_PLACEHOLDERS);
    const newState = { ...state };
    const nestedPath = this.getNestedStatePath(nestedIds);
    const nestedState = {
      ...AJAX_INITIAL_STATE,
      ..._.get(newState, nestedPath, {}),
    };

    _.setWith(
      newState,
      nestedPath,
      defaultAxiosUpdater(status, dataUpdater)(nestedState, data || context, context),
      Object,
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
    primaryKey = 'id',
  }) {
    const nestedStore = new ResourceStore({
      parent: this,
      name: `${this.name}.${name}`,
      endpoint: (id, ...nestedIds) =>
        `${this.getEndpoint(nestedIds)}${id}${endpoint}`,
      primaryKey,
    });
    this.nestedStores[name] = nestedStore;
    this.addNestedActionHandlers(nestedStore);
  }
}

import requestKey from './requestKey';
import AxiosStore from './axiosStore';
import { mergeConfigs } from './utils';
import {
  unionById,
  removeById,
  addOrUpdateById
} from './dataUpdaters';

function getResourceState(name, state) {
  const resourceState = state[name];
  if (_.isUndefined(resourceState)) {
    throw { message: `Could not find ${name} in store.` };
  }
  return resourceState;
}

function getPreviousRequest(
  resourceState,
  { url, data = {}, method = "GET" }
) {
  const { requests } = resourceState;
  const key = requestKey({ url, data, method });
  return requests[key];
}

function resourceResponse(status, data) {
  return Promise.resolve({ status, data });
}

function axiosToResourceResponse(axiosResponse) {
  const { status, data } = axiosResponse;
  return { status, data };
}

export default class ResourceStore extends AxiosStore {
  constructor({
    name,
    endpoint,
    actions = {},
    config = {}
  }) {
    super({ name, config });
    this.endpoint = endpoint;

    /**
     * INDEX
     */

    this.addAxiosAction({
      name: 'forceIndex',
      request: (query = {}) => ({
        url: endpoint,
        data: query,
      }),
      dataUpdater: (state, action) => unionById(state.data, action.payload.data),
      success: axiosToResourceResponse
    });
    this.addThunkAction({
      name: 'index',
      thunk: (query = {}) => (actions) => (dispatch, getState) => {
        const resourceState = getResourceState(this.name, getState());
        const previousRequest = getPreviousRequest(resourceState, {
          url: this.endpoint,
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

    /**
     * SHOW
     */

    this.addAxiosAction({
      name: 'forceShow',
      request: (id) => ({ url: `${this.endpoint}${id}` }),
      dataUpdater: (state, action) => addOrUpdateById(state.data, action.payload.data),
      success: axiosToResourceResponse,
    });
    this.addThunkAction({
      name: 'show',
      thunk: (id) => (actions) => (dispatch, getState) => {
        const resourceState = getResourceState(this.name, getState());
        // It's possible that the resource may already be in the store, even if a
        // show request for `id` hasn't yet been made. If it's already present, we
        // can avoid making another request and simply return it from the store.
        const resource = resourceState.data[id];
        if (!_.isUndefined(resource)) {
          return resourceResponse(200, resource);
        }

        const previousRequest = getPreviousRequest(resourceState, {
          url: `${this.endpoint}${id}`
        });
        switch (_.get(previousRequest, "status")) {
          case "loading":
            return previousRequest.promise.then(axiosToResourceResponse);
          default:
            return dispatch(actions.forceShow(id));
        }
      },
    });

    /**
     * CREATE
     */

    this.addAxiosAction({
      name: 'create',
      request: (params = {}) => ({
        url: this.endpoint,
        data: params,
        method: 'POST',
      }),
      dataUpdater: (state, action) => addOrUpdateById(state.data, action.payload.data),
      success: axiosToResourceResponse,
    });

    /**
     * UPDATE
     */

    this.addAxiosAction({
      name: 'update',
      request: (id, updates = {}) => ({
        url: `${this.endpoint}${id}`,
        data: updates,
        method: 'PUT',
      }),
      dataUpdater: (state, action) => addOrUpdateById(state.data, action.payload.data),
      success: axiosToResourceResponse,
    });

    /**
     * DELETE
     */

    this.addAxiosAction({
      name: 'delete',
      request: (id) => ({
        url: `${this.endpoint}${id}`,
        method: 'DELETE'
      }),
      dataUpdater: (state, action) => removeById(state.data, action.payload.data),
      success: axiosToResourceResponse,
    });
  }
}

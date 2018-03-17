import { promiseActionType } from './actionTypes';

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

export default function axiosActionHandlers({
  actionType,
  dataUpdater,
}) {
  const type = promiseActionType(actionType);
  return {
    [type.LOADING]: (state, action) => ({
      ...state,
      loading: true,
      requests: updatedRequests(state, action),
    }),
    [type.SUCCESS]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      data: dataUpdater(state, action),
      requests: updatedRequests(state, action),
    }),
    [type.FAILURE]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      error: action.payload,
      requests: updatedRequests(state, action),
    }),
  };
}

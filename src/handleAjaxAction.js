export default function handleAjaxAction({ ajaxActionType, dataUpdater } = {}) {
  return {
    [ajaxActionType.LOADING]: (state, action) => ({
      ...state,
      loading: true,
      context: action.context,
    }),
    [ajaxActionType.SUCCESS]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      data: dataUpdater(state.data, action.payload, state.context),
    }),
    [ajaxActionType.FAILURE]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      error: action.payload,
    }),
  };
}

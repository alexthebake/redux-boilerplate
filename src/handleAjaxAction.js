export default function handleAjaxAction({ ajaxActionType, dataUpdater } = {}) {
  return {
    [ajaxActionType.LOADING]: state => ({
      ...state,
      loading: true,
    }),
    [ajaxActionType.SUCCESS]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      data: dataUpdater(state.data, action.payload),
    }),
    [ajaxActionType.FAILURE]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      error: action.payload,
    }),
  };
}

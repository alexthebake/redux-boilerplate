export default function handleAjaxAction({ actionType, dataUpdater } = {}) {
  return {
    [actionType.LOADING]: state => ({
      ...state,
      loading: true,
    }),
    [actionType.SUCCESS]: (state, action) => ({
      ...state,
      loaded: true,
      loading: false,
      data: dataUpdater(state.data, action.payload),
    }),
    [actionType.FAILURE]: (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
    }),
  };
}

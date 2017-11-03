export default function createReducer(initialState, actionHandlers) {
  return (state = initialState, action) => {
    if (_.has(actionHandlers, action.type)) {
      return actionHandlers[action.type](state, action);
    }
    return state;
  };
}

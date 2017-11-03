export function ajaxActionType(actionType) {
  return {
    LOADING: `${actionType}[LOADING]`,
    SUCCESS: `${actionType}[SUCCESS]`,
    FAILURE: `${actionType}[FAILURE]`,
  };
}

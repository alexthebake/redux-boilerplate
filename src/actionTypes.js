export function actionName(...blocks) {
  return _.map(blocks, block => `[${block}]`).join('');
}

export function ajaxActionType(actionType) {
  return {
    LOADING: `${actionType}[LOADING]`,
    SUCCESS: `${actionType}[SUCCESS]`,
    FAILURE: `${actionType}[FAILURE]`,
  };
}

export function promiseActionType(type) {
  return {
    LOADING: `[${type}][LOADING]`,
    SUCCESS: `[${type}][SUCCESS]`,
    FAILURE: `[${type}][FAILURE]`,
  };
}

import changeCase from 'change-case';

export function actionName(...blocks) {
  return changeCase.constantCase(blocks.join('_'));
}

export function promiseActionType(type) {
  return {
    LOADING: changeCase.constantCase(`${type}_LOADING`),
    SUCCESS: changeCase.constantCase(`${type}_SUCCESS`),
    FAILURE: changeCase.constantCase(`${type}_FAILURE`),
  };
}

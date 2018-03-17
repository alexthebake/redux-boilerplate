import { promiseActionType } from './actionTypes';

export default function promiseActionCreator({
  actionType,
  promiseCallback,
  loadingContext = () => {},
  successContext = () => {},
  failureContext = () => {},
}) {
  const type = promiseActionType(actionType);
  return dispatch => {
    const promise = promiseCallback(dispatch)
      .then(result => {
        dispatch({
          type: type.SUCCESS,
          payload: result,
          context: successContext(result)
        });
        return result;
      })
      .catch(error => {
        dispatch({
          type: type.FAILURE,
          payload: error,
          context: failureContext(error)
        });
        return error;
      });
    dispatch({
      type: type.LOADING,
      context: loadingContext(promise),
    });
    return promise;
  };
}

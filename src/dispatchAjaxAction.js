/**
 * Dispatches each action in the ajax action flow.
 * @param  {Object}  options.ajaxActionType Ajax action type (see actionTypes.js)
 * @param  {Object}  options.ajaxCallback   Callback that returns ajax request
 * @return {Promise}                        Ajax request
 */
export default function dispatchAjaxAction({ ajaxActionType, ajaxCallback } = {}) {
  return (dispatch) => {
    // Dispatch LOADING action
    dispatch({ type: ajaxActionType.LOADING });
    // Make ajax request
    return ajaxCallback(dispatch)
      .then((response) => {
        // If request is successful, dispatch SUCCESS action with response as payload
        dispatch({
          type: ajaxActionType.SUCCESS,
          payload: response.data,
        });
        // Resolve response
        return response;
      })
      .catch((error) => {
        // If request is not successful, dispatch FAILURE action with error as payload
        dispatch({
          type: ajaxActionType.FAILURE,
          payload: error,
        });
        // Resolve
        return error;
      });
  };
}

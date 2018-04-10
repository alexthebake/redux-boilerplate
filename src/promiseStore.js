import BasicStore from './basicStore';
import { promiseActionType } from './actionTypes';

export default class PromiseStore extends BasicStore {
  constructor(args) {
    super(args);
    _.forEach(args.actions, (config, name) => {
      if (_.isFunction(config.promiseCallback)) {
        this.addPromiseAction({ name, ...config });
      }
    });
  }

  getPromiseActions(actionType) {
    return {
      LOADING: this.actionCreators[actionType.LOADING],
      SUCCESS: this.actionCreators[actionType.SUCCESS],
      FAILURE: this.actionCreators[actionType.FAILURE],
    };
  }

  addPromiseAction({
    name,
    promiseCallback,
    loadingContext = (promise, args) => ([promise, ...args]),
    successContext = (result, args) => ([result, ...args]),
    failureContext = (error, args) => ([error, ...args]),
    loadingUpdater = state => state,
    successUpdater = state => state,
    failureUpdater = state => state,
  }) {
    const actionType = promiseActionType(name);
    this.addAction({
      name: actionType.LOADING,
      updater: loadingUpdater,
    });
    this.addAction({
      name: actionType.SUCCESS,
      updater: successUpdater,
    });
    this.addAction({
      name: actionType.FAILURE,
      updater: failureUpdater,
    });
    this.addThunkAction({
      name,
      thunk: (...args) => () => (dispatch) => {
        const promiseActions = this.getPromiseActions(actionType);
        const promise = promiseCallback(...args)
          .then((result) => {
            dispatch(promiseActions.SUCCESS(
              result,
              successContext(result, ...args),
            ));
            return result;
          })
          .catch((error) => {
            dispatch(promiseActions.FAILURE(
              error,
              failureContext(error, ...args),
            ));
            return error;
          });
        dispatch(promiseActions.LOADING(loadingContext(promise, ...args)));
        return promise;
      },
    });
  }
}

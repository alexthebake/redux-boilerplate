import BasicStore from './basicStore';
import { promiseActionType } from './actionTypes';

const DEFAULTS = {
  loadingContext: (promise, args = []) => ([promise, ...args]),
  successContext: (result, args = []) => ([result, ...args]),
  failureContext: (error, args = []) => ([error, ...args]),
  loadingUpdater: state => state,
  successUpdater: state => state,
  failureUpdater: state => state,
};

export default class PromiseStore extends BasicStore {
  constructor(args) {
    super(args);
    _.forEach(args.actions, (config, name) => {
      if (_.isFunction(config.promiseCallback)) {
        this.addPromiseAction({ name, ...config });
      }
    });
  }

  addPromiseAction({
    name,
    promiseCallback,
    loadingContext = DEFAULTS.loadingContext,
    successContext = DEFAULTS.successContext,
    failureContext = DEFAULTS.failureContext,
    loadingUpdater = DEFAULTS.loadingUpdater,
    successUpdater = DEFAULTS.successUpdater,
    failureUpdater = DEFAULTS.failureUpdater,
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
      thunk: (...args) => (actions) => {
        const promiseActions = {
          LOADING: actions[actionType.LOADING],
          SUCCESS: actions[actionType.SUCCESS],
          FAILURE: actions[actionType.FAILURE],
        };
        const promise = promiseCallback(...args)
          .then((result) => {
            promiseActions.SUCCESS(
              result,
              successContext(result, ...args),
            );
            return result;
          })
          .catch((error) => {
            promiseActions.FAILURE(
              error,
              failureContext(error, ...args),
            );
            return error;
          });
        promiseActions.LOADING(loadingContext(promise, ...args));
        return promise;
      },
    });
  }
}

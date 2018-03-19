import ThunkStore from './thunkStore';
import { promiseActionType } from './actionTypes';

export default class PromiseStore extends ThunkStore {
  constructor(args) {
    super(args);
    _.forEach(args.actions, (config, name) => {
      if (!config.promiseCallback) return;
      this.addPromiseAction({ name, ...config });
    });
  }

  addPromiseAction({
    name,
    promiseCallback,
    loadingContext = () => {},
    successContext = () => {},
    failureContext = () => {},
    loadingReducer = (state) => state,
    successReducer = (state) => state,
    failureReducer = (state) => state,
  }) {
    const actionType = promiseActionType(name);
    const extractPayload = (reducer) => (state, action) => {
      const newAction = {
        ...action,
        payload: action.payload.data,
        context: action.payload.context,
      };
      return reducer(state, newAction);
    };
    this.addAction({
      name: actionType.LOADING,
      reducer: extractPayload(loadingReducer),
    });
    this.addAction({
      name: actionType.SUCCESS,
      reducer: extractPayload(successReducer),
    });
    this.addAction({
      name: actionType.FAILURE,
      reducer: extractPayload(failureReducer),
    });
    this.addThunkAction({
      name,
      thunk: (...args) => (actions) => (dispatch) => {
        const promise = promiseCallback(...args)
          .then(result => {
            dispatch(actions[actionType.SUCCESS]({
              data: result,
              context: successContext(result, ...args),
            }));
            return result;
          })
          .catch(error => {
            dispatch(actions[actionType.LOADING]({
              data: error,
              context: failureContext(error, ...args),
            }));
            return error;
          });
        dispatch(actions[actionType.LOADING]({
          data: args,
          context: loadingContext(promise, ...args),
        }));
        return promise;
      },
    });
  }
}

import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import PromiseStore from '../src/promiseStore';

function delay(data, timeout = 10) {
  return new Promise(resolve => setTimeout(() => resolve(data), 10));
}

describe('PromiseStore', () => {
  describe('instance', () => {
    let testStore;
    const name = 'test';
    const initialState = { data: [1, 2, 3] };
    const promiseAction = {
      name: 'makePromise',
      promiseCallback: () => delay(4),
    };

    beforeEach(() => {
      sinon.spy(PromiseStore.prototype, 'addPromiseAction');
      testStore = new PromiseStore({
        name,
        initialState,
        actions: {
          append: promiseAction,
        },
      });
    });

    afterEach(() => {
      PromiseStore.prototype.addPromiseAction.restore();
    });

    describe('constructor', () => {
      it('adds promise actions', () => {
        expect(PromiseStore.prototype.addPromiseAction)
          .to.have.been.calledWithMatch(promiseAction);
      });
    });
  });

  describe('examples', () => {
    let store;
    let actions;
    let mockStore;
    let mockActions;

    const middlewares = applyMiddleware(thunk);
    const createMockStore = configureMockStore([thunk]);

    describe('lifecycle store', () => {
      let inputValue;
      let resolveValue;
      const lifecycleStore = new PromiseStore({
        name: 'lifecycle',
        initialState: {
          status: null,
          data: null,
          error: null,
          contexts: [],
        },
        actions: {
          makePromise: {
            promiseCallback: (value) => delay(value + 1),
            loadingContext: (promise, ...args) => ({ promise, args }),
            successContext: (result, ...args) => ({ result, args }),
            loadingUpdater: (state, context) => ({
              ...state,
              status: 'loading',
              contexts: [...state.contexts, context],
            }),
            successUpdater: (state, result, context) => ({
              ...state,
              status: 'success',
              data: result,
              contexts: [...state.contexts, context],
            }),
          },
        },
      });
      const reducers = combineReducers({
        lifecycle: lifecycleStore.createReducer(),
      });

      beforeEach(() => {
        inputValue = _.random(0, 10);
        resolveValue = inputValue + 1;
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          lifecycle: lifecycleStore.initialState,
        });
        actions = lifecycleStore.bindActionCreators(store.dispatch);
        mockActions = lifecycleStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        const promise = mockActions.makePromise(inputValue);
        return promise.then(() => {
          expect(mockStore.getActions()).to.eql([
            {
              type: 'LIFECYCLE_MAKE_PROMISE_LOADING',
              payload: [{ args: [inputValue], promise }],
            },
            {
              type: 'LIFECYCLE_MAKE_PROMISE_SUCCESS',
              payload: [resolveValue, { args: [inputValue], result: resolveValue }],
            },
          ]);
        });
      });

      it('updates state', () => {
        const promise = actions.makePromise(inputValue);
        expect(store.getState().lifecycle).to.eql({
          data: null,
          error: null,
          status: 'loading',
          contexts: [{ args: [inputValue], promise }],
        });
        return promise.then(() => {
          expect(store.getState().lifecycle).to.eql({
            data: resolveValue,
            error: null,
            status: 'success',
            contexts: [
              { args: [inputValue], promise },
              { args: [inputValue], result: resolveValue },
            ],
          });
        });
      });
    });
  });
});

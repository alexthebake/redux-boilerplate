import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import PromiseStore from '../src/promiseStore';

function delay(data, timeout = 10) {
  return new Promise(resolve => setTimeout(() => resolve(data), timeout));
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
      it('sets name and initialState', () => {
        expect(testStore.name).to.eq(name);
        expect(testStore.initialState).to.eq(initialState);
      });

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

    describe('default store',  () => {
      const testStore = new PromiseStore({
        name: 'test',
        initialState: null,
        actions: {
          makePromise: {
            promiseCallback: () => Promise.resolve(),
          },
          failPromise: {
            promiseCallback: () => Promise.reject(),
          },
        },
      });

      const reducers = combineReducers({
        test: testStore.createReducer(),
      });

      beforeEach(() => {
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          test: testStore.initialState,
        });
        actions = testStore.bindActionCreators(store.dispatch);
        mockActions = testStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        const makePromise = mockActions.makePromise();
        const failPromise = mockActions.failPromise();
        return Promise.all([makePromise, failPromise]).then(() => {
          expect(mockStore.getActions()).to.eql([
            {
              type: 'TEST_MAKE_PROMISE_LOADING',
              payload: [[makePromise]],
            },
            {
              type: 'TEST_FAIL_PROMISE_LOADING',
              payload: [[failPromise]],
            },
            {
              type: 'TEST_MAKE_PROMISE_SUCCESS',
              payload: [undefined, [undefined]],
            },
            {
              type: 'TEST_FAIL_PROMISE_FAILURE',
              payload: [undefined, [undefined]],
            },
          ]);
        });
      });

      it('does nothing to the state (by default)', () => {
        const makePromise = mockActions.makePromise().then(() => {
          expect(store.getState().test).to.eql(null);
        });
        const failPromise = mockActions.failPromise().catch(() => {
          expect(store.getState().test).to.eql(null);
        });
        expect(store.getState().test).to.eql(null);
        return Promise.all([makePromise, failPromise]);
      });
    });

    describe('lifecycle store', () => {
      let inputValue;
      let resolveValue;
      const lifecycleStubs = {
        loadingContext: sinon.stub()
          .callsFake((promise, ...args) => ({ promise, args })),
        successContext: sinon.stub()
          .callsFake((result, ...args) => ({ result, args })),
        failureContext: sinon.stub()
          .callsFake((error, ...args) => ({ error, args })),
        loadingUpdater: sinon.stub()
          .callsFake((state, context) => ({
            ...state,
            status: 'loading',
            contexts: [...state.contexts, context],
          })),
        successUpdater: sinon.stub()
          .callsFake((state, result, context) => ({
            ...state,
            status: 'success',
            data: result,
            contexts: [...state.contexts, context],
          })),
        failureUpdater: sinon.stub()
          .callsFake((state, result, context) => ({
            ...state,
            status: 'failure',
            error: result,
            contexts: [...state.contexts, context],
          })),
      };
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
            promiseCallback: value => delay(value + 1),
            ...lifecycleStubs,
          },
          failPromise: {
            promiseCallback: value => delay(value + 1).then(data => Promise.reject(data)),
            ...lifecycleStubs,
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
        const makePromise = mockActions.makePromise(inputValue);
        const failPromise = mockActions.failPromise(inputValue);
        return Promise.all([makePromise, failPromise]).then(() => {
          expect(lifecycleStubs.loadingContext).to.have.been.called;
          expect(lifecycleStubs.successContext).to.have.been.called;
          expect(lifecycleStubs.failureContext).to.have.been.called;
          expect(mockStore.getActions()).to.eql([
            {
              type: 'LIFECYCLE_MAKE_PROMISE_LOADING',
              payload: [{ args: [inputValue], promise: makePromise }],
            },
            {
              type: 'LIFECYCLE_FAIL_PROMISE_LOADING',
              payload: [{ args: [inputValue], promise: failPromise }],
            },
            {
              type: 'LIFECYCLE_MAKE_PROMISE_SUCCESS',
              payload: [resolveValue, { args: [inputValue], result: resolveValue }],
            },
            {
              type: 'LIFECYCLE_FAIL_PROMISE_FAILURE',
              payload: [resolveValue, { args: [inputValue], error: resolveValue }],
            },
          ]);
        });
      });

      it('updates state on success', () => {
        const promise = actions.makePromise(inputValue);
        expect(store.getState().lifecycle).to.eql({
          data: null,
          error: null,
          status: 'loading',
          contexts: [{ args: [inputValue], promise }],
        });
        return promise.then(() => {
          expect(lifecycleStubs.loadingUpdater).to.have.been.called;
          expect(lifecycleStubs.successUpdater).to.have.been.called;
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

      it('updates state on failure', () => {
        const promise = actions.failPromise(inputValue);
        expect(store.getState().lifecycle).to.eql({
          data: null,
          error: null,
          status: 'loading',
          contexts: [{ args: [inputValue], promise }],
        });
        return promise.then(() => {
          expect(lifecycleStubs.loadingUpdater).to.have.been.called;
          expect(lifecycleStubs.failureUpdater).to.have.been.called;
          expect(store.getState().lifecycle).to.eql({
            data: null,
            error: resolveValue,
            status: 'failure',
            contexts: [
              { args: [inputValue], promise },
              { args: [inputValue], error: resolveValue },
            ],
          });
        });
      });
    });
  });
});

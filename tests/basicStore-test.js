import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import BasicStore from '../src/basicStore';

function delay(data, timeout = 10) {
  return new Promise(resolve => setTimeout(() => resolve(data), timeout));
}

describe('BasicStore', () => {
  describe('instance', () => {
    let testStore;
    const name = 'test';
    const initialState = { data: [1, 2, 3] };
    const appendAction = (state, i) => ({
      ...state,
      data: [...state.data, i],
    });
    const appendThunk = i => boundActions => boundActions.append(i);

    beforeEach(() => {
      sinon.spy(BasicStore.prototype, 'addAction');
      sinon.spy(BasicStore.prototype, 'addThunkAction');
      testStore = new BasicStore({
        name,
        initialState,
        actions: {
          append: appendAction,
          appendThunk: { thunk: appendThunk },
        },
      });
    });

    afterEach(() => {
      BasicStore.prototype.addAction.restore();
      BasicStore.prototype.addThunkAction.restore();
    });

    describe('constructor', () => {
      it('adds basic actions', () => {
        expect(BasicStore.prototype.addAction).to.have.been.calledWithMatch({
          name: 'append',
          updater: appendAction,
        });
      });

      it('adds thunk actions', () => {
        expect(BasicStore.prototype.addThunkAction).to.have.been.calledWithMatch({
          name: 'appendThunk',
          thunk: appendThunk,
        });
      });

      describe('when no actions', () => {
        beforeEach(() => {
          BasicStore.prototype.addAction.reset();
          testStore = new BasicStore({ name, initialState });
        });

        it('sets empty actions', () => {
          expect(testStore.actions).to.be.empty;
        });

        it('does not add base actions', () => {
          expect(BasicStore.prototype.addAction).to.not.have.been.called;
        });
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

    describe('counter store', () => {
      const counterStore = new BasicStore({
        name: 'counter',
        initialState: 0,
        actions: {
          increment: (state, i) => state + i,
        },
      });
      const reducers = combineReducers({
        counter: counterStore.createReducer(),
      });

      beforeEach(() => {
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          counter: counterStore.initialState,
        });
        actions = counterStore.bindActionCreators(store.dispatch);
        mockActions = counterStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        const value = _.random(5, 10);
        mockActions.increment(value);
        expect(mockStore.getActions()).to.eql([{
          type: 'COUNTER_INCREMENT',
          payload: [value],
        }]);
      });

      it('updates state', () => {
        const value = _.random(5, 10);
        actions.increment(value);
        expect(store.getState().counter).to.eq(value);
      });
    });

    describe('async store', () => {
      const expectedData = [1, 2, 3];
      const asyncStore = new BasicStore({
        name: 'async',
        initialState: {
          loaded: true,
          loading: false,
          data: null,
        },
        actions: {
          loading: state => ({ ...state, loading: true }),
          success: (state, data) => ({
            ...state,
            data,
            loaded: true,
            loading: false,
          }),
          performAsync: {
            thunk: () => (boundActions) => {
              boundActions.loading();
              return delay(expectedData).then((result) => {
                boundActions.success(result);
                return result;
              });
            },
          },
        },
      });
      const reducers = combineReducers({
        async: asyncStore.createReducer(),
      });

      beforeEach(() => {
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          async: asyncStore.initialState,
        });
        actions = asyncStore.bindActionCreators(store.dispatch);
        mockActions = asyncStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        return mockActions.performAsync().then((result) => {
          expect(mockStore.getActions()).to.eql([
            { type: 'ASYNC_LOADING', payload: [] },
            { type: 'ASYNC_SUCCESS', payload: [expectedData] },
          ]);
          expect(result).to.eql(expectedData);
        });
      });

      it('updates state', () => {
        return actions.performAsync().then(() => {
          expect(store.getState().async).to.eql({
            loaded: true,
            loading: false,
            data: expectedData,
          });
        });
      });
    });
  });
});

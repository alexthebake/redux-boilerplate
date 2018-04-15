import * as redux from 'redux';
import configureMockStore from 'redux-mock-store';
import * as createReducer from '../src/createReducer';
import BaseStore from '../src/baseStore';

describe('BaseStore', () => {
  describe('instance', () => {
    let testStore;
    const name = 'test';
    const initialState = { data: [1, 2, 3] };
    const appendAction = {
      name: 'append',
      action: i => ({ type: 'TEST_APPEND', payload: i }),
      reducers: {
        TEST_APPEND: (state, action) => ({
          ...state,
          data: [...state.data, action.payload],
        }),
      },
    };
    const resetAction = {
      name: 'reset',
      action: () => ({ type: 'TEST_RESET' }),
      reducers: {
        TEST_RESET: () => initialState,
      },
    };

    beforeEach(() => {
      sinon.spy(redux, 'bindActionCreators');
      sinon.spy(createReducer, 'default');
      sinon.spy(BaseStore.prototype, 'addBaseAction');
      testStore = new BaseStore({
        name,
        initialState,
        actions: { append: appendAction },
      });
    });

    afterEach(() => {
      redux.bindActionCreators.restore();
      createReducer.default.restore();
      BaseStore.prototype.addBaseAction.restore();
    });

    describe('constructor', () => {
      it('sets name and initialState', () => {
        expect(testStore.name).to.eq(name);
        expect(testStore.initialState).to.eq(initialState);
      });

      it('sets root action creator to null', () => {
        expect(testStore.rootActionCreator).to.eq(null);
      });

      it('adds base actions', () => {
        expect(BaseStore.prototype.addBaseAction)
          .to.have.been.calledWithMatch(appendAction);
      });

      describe('when no actions', () => {
        beforeEach(() => {
          BaseStore.prototype.addBaseAction.reset();
          testStore = new BaseStore({ name, initialState });
        });

        it('sets empty actions', () => {
          expect(testStore.actions).to.be.empty;
        });

        it('does not add base actions', () => {
          expect(BaseStore.prototype.addBaseAction).to.not.have.been.called;
        });
      });
    });

    describe('get actionCreators', () => {
      it('returns map between action name and action creator', () => {
        expect(testStore.actionCreators).to.eql({ append: appendAction.action });
      });
    });

    describe('get actionHandlers', () => {
      it('returns map between action type and reducers', () => {
        expect(testStore.actionHandlers).to.eql({ ...appendAction.reducers });
      });
    });

    describe('bindActionCreators', () => {
      const dispatch = sinon.stub();

      beforeEach(() => {
        testStore.bindActionCreators(dispatch);
      });

      it('binds action creators to dispatch', () => {
        expect(redux.bindActionCreators)
          .to.have.been.calledWith(testStore.actionCreators, dispatch);
      });
    });

    describe('createReducer', () => {
      beforeEach(() => {
        testStore.createReducer();
      });

      it('creates reducer with initial state and action handlers', () => {
        expect(createReducer.default)
          .to.have.been.calledWith(testStore.initialState, testStore.actionHandlers);
      });
    });

    describe('addBaseAction', () => {
      beforeEach(() => {
        testStore.addBaseAction(resetAction);
      });

      it('adds actionConfig to actions by name', () => {
        const { action, reducers } = resetAction;
        expect(testStore.actions[resetAction.name]).to.eql({ action, reducers });
      });
    });

    describe('defineBaseActions', () => {
      const fakeAction = {
        name: 'fakeAction',
        invalid: 'base action config',
      };

      beforeEach(() => {
        BaseStore.prototype.addBaseAction.reset();
        testStore.defineBaseActions({
          [resetAction.name]: resetAction,
          [fakeAction.name]: fakeAction,
        });
      });

      it('adds baseActions from actionConfigs', () => {
        expect(BaseStore.prototype.addBaseAction)
          .to.have.been.calledWithMatch(resetAction);
      });

      it('does not add actionConfigs that are not baseActions', () => {
        expect(BaseStore.prototype.addBaseAction)
          .to.not.have.been.calledWithMatch(fakeAction);
      });
    });
  });

  describe('examples', () => {
    let store;
    let actions;
    let mockStore;
    let mockActions;

    const createMockStore = configureMockStore();

    describe('counter store', () => {
      const counterStore = new BaseStore({
        name: 'counter',
        initialState: 0,
        actions: {
          increment: {
            action: (i = 1) => ({ type: 'COUNTER_INCREMENT', payload: i }),
            reducers: {
              COUNTER_INCREMENT: (state, action) => state + action.payload,
            },
          },
        },
      });
      const reducers = redux.combineReducers({
        counter: counterStore.createReducer(),
      });

      beforeEach(() => {
        store = redux.createStore(reducers, {});
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
          payload: value,
        }]);
      });

      it('updates state', () => {
        const value = _.random(5, 10);
        actions.increment(value);
        expect(store.getState().counter).to.eq(value);
      });
    });
  });
});

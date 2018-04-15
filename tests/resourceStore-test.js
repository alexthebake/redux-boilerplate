import axios from 'axios';
import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import ResourceStore from '../src/resourceStore';

const middlewares = applyMiddleware(thunk);
const createMockStore = configureMockStore([thunk]);

describe('ResourceStore', () => {
  describe('instance', () => {
    let resourceStore;

    beforeEach(() => {
      sinon.spy(ResourceStore.prototype, 'defineActions');
      resourceStore = new ResourceStore({
        name: 'resource',
        endpoint: '/api/resources/',
      });
    });

    afterEach(() => {
      ResourceStore.prototype.defineActions.restore();
    });

    describe('constructor', () => {
      it('defines crud actions', () => {
        expect(ResourceStore.prototype.defineActions).to.have.been.called;
      });
    });
  });

  describe('examples', () => {
    let clock;
    let store;
    let actions;
    let mockStore;
    let mockActions;
    let requestStub;

    const resolveValue = {
      status: 200,
      statusText: 'OK',
      data: [{ id: 1 }, { id: 2 }],
    };

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      requestStub = sinon.stub(axios, 'request').resolves(resolveValue);
    });

    afterEach(() => {
      clock.restore();
      axios.request.restore();
    });

    describe('default resource store', () => {
      const resourceStore = new ResourceStore({
        name: 'resource',
        endpoint: '/api/resources/',
      });
      const reducers = combineReducers({
        resource: resourceStore.createReducer(),
      });

      beforeEach(() => {
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          resource: resourceStore.initialState,
        });
        actions = resourceStore.bindActionCreators(store.dispatch);
        mockActions = resourceStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        const promise = mockActions.forceIndex();
        return promise.then(() => {
          expect(mockStore.getActions()).to.eql([
            {
              type: 'RESOURCE_FORCE_INDEX_LOADING',
              payload: [
                {
                  args: [],
                  key: 'GET /api/resources/?{}',
                  startTime: new Date(),
                  promise: promise,
                  status: 'loading',
                },
              ],
            },
            {
              type: 'RESOURCE_FORCE_INDEX_SUCCESS',
              payload: [
                resolveValue,
                {
                  args: [],
                  key: 'GET /api/resources/?{}',
                  endTime: new Date(),
                  response: resolveValue,
                  status: 'success',
                },
              ],
            }
          ]);
        });
      });

      it('updates state', () => {
        const promise = actions.forceIndex();
        const loadingState = store.getState().resource;
        expect(loadingState.loaded).to.eq(false);
        expect(loadingState.loading).to.eq(true);
        return promise.then(() => {
          expect(store.getState().resource).to.eql({
            loaded: true,
            loading: false,
            error: {},
            data: {
              1: resolveValue.data[0],
              2: resolveValue.data[1],
            },
            requests: {
              'GET /api/resources/?{}': {
                args: [],
                key: 'GET /api/resources/?{}',
                startTime: new Date(),
                endTime: new Date(),
                response: resolveValue,
                status: 'success',
                promise,
              },
            },
          });
        });
      });
    });
  });
});

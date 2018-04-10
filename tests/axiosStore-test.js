import axios from 'axios';
import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import AxiosStore from '../src/axiosStore';

const middlewares = applyMiddleware(thunk);
const createMockStore = configureMockStore([thunk]);

describe('AxiosStore', () => {
  describe('instance', () => {
    let testStore; // eslint-disable-line no-unused-vars
    const name = 'test';
    const initialState = { data: [1, 2, 3] };
    const requestAction = {
      name: 'makeRequest',
      request: { url: '/some-fake-url/' },
    };

    beforeEach(() => {
      sinon.spy(AxiosStore.prototype, 'addAxiosAction');
      testStore = new AxiosStore({
        name,
        initialState,
        actions: {
          request: requestAction,
        },
      });
    });

    afterEach(() => {
      AxiosStore.prototype.addAxiosAction.restore();
    });

    describe('constructor', () => {
      it('adds promise actions', () => {
        expect(AxiosStore.prototype.addAxiosAction)
          .to.have.been.calledWithMatch(requestAction);
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

    const resolveValue = { statusText: 'OK', data: [1, 2, 3] };

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      requestStub = sinon.stub(axios, 'request').resolves(resolveValue);
    });

    afterEach(() => {
      clock.restore();
      axios.request.restore();
    });

    describe('default request store', () => {
      const requestStore = new AxiosStore({
        name: 'request',
      });
      requestStore.addAxiosAction({
        name: 'request',
        request: {
          url: '/some-fake-url/',
        },
        dataUpdater: (state, result) => result.data,
      })
      const reducers = combineReducers({
        request: requestStore.createReducer(),
      });

      beforeEach(() => {
        store = createStore(reducers, {}, middlewares);
        mockStore = createMockStore({
          request: requestStore.initialState,
        });
        actions = requestStore.bindActionCreators(store.dispatch);
        mockActions = requestStore.bindActionCreators(mockStore.dispatch);
      });

      it('dispatches actions', () => {
        const promise = mockActions.request();
        return promise.then(() => {
          expect(mockStore.getActions()).to.eql([
            {
              type: 'REQUEST_REQUEST_LOADING',
              payload: [
                {
                  args: [],
                  key: 'GET /some-fake-url/?{}',
                  startTime: new Date(),
                  promise: promise,
                  status: 'loading',
                },
              ],
            },
            {
              type: 'REQUEST_REQUEST_SUCCESS',
              payload: [
                resolveValue,
                {
                  args: [],
                  key: 'GET /some-fake-url/?{}',
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
        const promise = actions.request();
        const loadingState = store.getState().request;
        expect(loadingState.loaded).to.eq(false);
        expect(loadingState.loading).to.eq(true);
        return promise.then(() => {
          expect(store.getState().request).to.eql({
            loaded: true,
            loading: false,
            error: {},
            data: resolveValue.data,
            requests: {
              'GET /some-fake-url/?{}': {
                args: [],
                key: 'GET /some-fake-url/?{}',
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

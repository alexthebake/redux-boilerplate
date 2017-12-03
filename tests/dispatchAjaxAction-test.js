import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ajaxActionType } from '../src/actionTypes';
import dispatchAjaxAction from '../src/dispatchAjaxAction';

let store;
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('dispatchAjaxAction', () => {
  const type = ajaxActionType('TYPE');
  const context = { test: 'payload' };

  let action;
  let promise;
  let response;
  beforeEach(() => {
    store = mockStore({});
  });

  it('dispatches pending action', () => {
    const ajaxCallback = sinon.stub().resolves({ ok: true });
    const action = dispatchAjaxAction({ ajaxActionType: type, ajaxCallback, context });
    store.dispatch(action);
    expect(store.getActions()).to.deep.include({ type: type.LOADING, context });
  });

  describe('ajax call resolves', () => {
    const resource = { id: 1, name: 'Test' };
    response = { data: resource };

    beforeEach(() => {
      action = dispatchAjaxAction({
        ajaxActionType: type,
        ajaxCallback: sinon.stub().resolves(response),
      });
      promise = store.dispatch(action);
    });

    it('dispatches success action with response payload', () => {
      return promise.then((r) => {
        expect(store.getActions()).to.deep.include({
          type: type.SUCCESS,
          payload: resource,
        });
      });
    });

    it('returns response', () => {
      return promise.then(r => expect(r).to.eql(response));
    });
  });

  describe('ajax call rejects', () => {
    const error = { message: 'fail' }

    beforeEach(() => {
      action = dispatchAjaxAction({
        ajaxActionType: type,
        ajaxCallback: sinon.stub().rejects(error),
      });
      promise = store.dispatch(action);
    });

    it('dispatches failure action with error object', () => {
      return promise.then((r) => {
        expect(store.getActions()).to.deep.include({
          type: type.FAILURE,
          payload: error,
        });
      });
    });

    it('returns response', () => {
      return promise.then(r => expect(r).to.eql(error));
    });
  });
});

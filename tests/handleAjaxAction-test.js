import handleAjaxAction from '../src/handleAjaxAction';
import { ajaxActionType } from '../src/actionTypes';
import { unionById } from '../src/dataUpdaters';
import { AJAX_INITIAL_STATE } from '../src/constants';

const ACTION_TYPE = ajaxActionType('TEST');

describe('handleAjaxAction', () => {
  let reducers;
  beforeEach(() => {
    reducers = handleAjaxAction({
      ajaxActionType: ACTION_TYPE,
      dataUpdater: unionById,
    });
  });

  it('returns a map from ajax action type to reducers', () => {
    expect(reducers).to.be.a('object');
    _.each(ACTION_TYPE, (actionType) => {
      expect(reducers[actionType]).to.be.a('function');
    });
  });

  describe('loading reducer', () => {
    it('sets error to null and loading to true', () => {
      const state = reducers[ACTION_TYPE.LOADING](AJAX_INITIAL_STATE, {});
      expect(state.error).to.be.null;
      expect(state.loading).to.be.true;
    });

    it('sets given context', () => {
      const context = { test: 'data' };
      const state = reducers[ACTION_TYPE.LOADING](AJAX_INITIAL_STATE, { context });
      expect(state.context).to.eql(context);
    });
  });

  describe('success reducer', () => {
    it('sets error to null, updates data and and loading statuses', () => {
      const newData = [{ id: 1, name: 'Alice' }];
      const updater = sinon.stub().returns(newData);
      reducers = handleAjaxAction({
        ajaxActionType: ACTION_TYPE,
        dataUpdater: updater,
      });
      const action = { payload: { id: 1 , name: 'Bob' } };
      const state = reducers[ACTION_TYPE.SUCCESS](AJAX_INITIAL_STATE, action);
      expect(updater).to.have.been.calledWith(AJAX_INITIAL_STATE.data, action.payload);
      expect(state.data).to.eql(newData);
      expect(state.error).to.be.null;
      expect(state.loaded).to.be.true;
      expect(state.loading).to.be.false;
    });
  });

  describe('failure reducer', () => {
    const action = { payload: { message: 'fail' } };

    it('sets error and updates loading statuses', () => {
      const state = reducers[ACTION_TYPE.FAILURE](AJAX_INITIAL_STATE, action);
      expect(state.error).to.eq(action.payload);
      expect(state.loaded).to.be.true;
      expect(state.loading).to.be.false;
    });
  });
});

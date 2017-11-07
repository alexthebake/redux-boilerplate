import createReducer from '../src/createReducer';

describe('createReducer', () => {
  it('returns a function', () => {
    expect(createReducer({}, {})).to.be.a('function');
  });

  describe('actionHandlers has given action type', () => {
    const state = { data: '' };
    const updatedState = { data: 'test' };
    const actionHandlers = { TEST: sinon.stub().returns(updatedState) };
    const action = { type: 'TEST', payload: 'test' };
    const reducer = createReducer(state, actionHandlers);

    it('dispatches reducer function with state and given action', () => {
      const newState = reducer(state, action);
      expect(newState).to.deep.eq(updatedState);
      expect(actionHandlers.TEST).to.have.been.calledWith(state, action);
    });
  });

  describe('actionHandlers does not have given action type', () => {
    const state = { data: '' };
    const actionHandlers = { TEST: sinon.stub() };
    const action = { type: 'FOO', payload: 'foo' };
    const reducer = createReducer(state, actionHandlers);

    it('returns state and dispatches no reducer functions', () => {
      const newState = reducer(state, action);
      expect(newState).to.deep.eq(state);
      expect(actionHandlers.TEST).to.not.have.been.called;
    });
  });
});

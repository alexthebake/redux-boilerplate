import {
  actionName,
  ajaxActionType,
} from '../src/actionTypes';

const actionType = 'TEST_ACTION';

describe('actionTypes', () => {
  let type;

  describe('actionName', () => {
    beforeEach(() => {
      type = actionName('foo', 'bar');
    });

    it('returns constant case action name', () => {
      expect(type).to.eq('FOO_BAR');
    });
  });

  describe('ajaxActionType', () => {
    beforeEach(() => {
      type = ajaxActionType(actionType);
    });

    it('returns an object with ajax status keys', () => {
      expect(type).to.have.property('LOADING');
      expect(type).to.have.property('SUCCESS');
      expect(type).to.have.property('FAILURE');
    });

    it('returns unique values that include given actionType', () => {
      const values = _.values(type);
      expect(values).to.eql(_.uniq(values));
      expect(type.LOADING).to.include(actionType);
      expect(type.SUCCESS).to.include(actionType);
      expect(type.FAILURE).to.include(actionType);
    });
  });
});

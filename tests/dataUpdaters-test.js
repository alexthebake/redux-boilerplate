import {
  removeById,
  unionById,
  addOrUpdateById,
} from '../src/dataUpdaters';

describe('dataUpdaters', () => {
  const oldData = {
    '1': { id: '1', name: 'Alice' },
    '2': { id: '2', name: 'Bob' },
    '3': { id: '3', name: 'Carol' },
  };

  describe('removeById', () => {
    const id = '2';

    it('returns new object with property removed by id', () => {
      const data = removeById(oldData, id);
      const expectedData = { '1': oldData['1'], '3': oldData['3'] };
      expect(data).to.eql(expectedData);
    });
  });

  describe('unionById', () => {
    const newData = [
      { id: '1', name: 'Aaron' },
      { id: '4', name: 'Dave' },
      { id: '5', name: 'Earl' },
    ];

    it('maintains old data but overwrites new data based on id', () => {
      const data = unionById(oldData, newData);
      const expectedData = {
        ...oldData,
        '1': newData[0],
        '4': newData[1],
        '5': newData[2],
      };
      expect(data).to.eql(expectedData);
    });
  });

  describe('addOrUpdateById', () => {
    describe('adding', () => {
      const resource = { 'id': '4', name: 'Badass Cowboy' };

      it('maintains old data and adds new resource', () => {
        const data = addOrUpdateById(oldData, resource);
        const expectedData = { ...oldData, [resource.id]: resource };
        expect(data).to.eql(expectedData);
      });
    });

    describe('updating', () => {
      const resource = { 'id': '1', name: 'Badass Cowboy' };

      it('maintains old data but overwrites resource based on id', () => {
        const data = addOrUpdateById(oldData, resource);
        const expectedData = { ...oldData, [resource.id]: resource };
        expect(data).to.eql(expectedData);
      });
    });
  });
});

export default class StoreIndex {
  constructor(stores) {
    this.stores = stores;
  }

  createReducers() {
    const reducers = {};
    _.forEach(this.stores, (store) => {
      reducers[store.name] = store.createReducer();
    });
    return reducers;
  }

  bindActionCreators(dispatch) {
    const actions = {};
    _.forEach(this.stores, (store) => {
      actions[store.name] = store.bindActionCreators(dispatch);
    });
    return actions;
  }
}

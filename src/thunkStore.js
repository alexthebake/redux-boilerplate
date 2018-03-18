import BasicStore from './basicStore';

export default class ThunkStore extends BasicStore {
  constructor(args) {
    super(args);
    _.forEach(args.actions, (config, name) => {
      if (!config.thunk) return;
      this.addThunkAction({ name, ...config });
    });
  }

  addThunkAction({ name, thunk }) {
    this.actions[name] = {
      action: (...args) => thunk(...args)(this.actionCreators),
    };
  }
}

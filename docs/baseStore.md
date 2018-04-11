# BasicStore
BaseStore provides all the boilerplate for creating actions and reducers with
some initial state within one file.

## API
### `constructor({ name, initialState, actions = {} })`
BasicStores take an options object with the following shape:
```javascript
/**
 * @param {string} options.name         Name of store
 * @param {*}      options.initialState Initial state for store
 * @param {object} [options.actions={}] Actions to initialize with store
 */
```

#### Example
```javascript
const counterStore = new BaseStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: {
      action: (i = 1) => {
        return {
          type: 'INCREMENT',
          payload: i,
        };
      },
      reducers: {
        INCREMENT: (state, action) => {
          return state + action.payload;
        };
      },
    },
  },
});
```
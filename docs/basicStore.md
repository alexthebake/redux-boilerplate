# BasicStore
The BasicStore allows you to define multiple action creators and reducers in
the same file.

## Setup
1. Define your store
```javascript
/** app/stores/myStore.js */
import { BasicStore } from '@thebasement/redux-boilerplate';

export default new BasicStore({
  actions: {
    foo: {
      // ...
    }
  }
});
```

2. Create reducer for store
```javascript
/** app/reducers/index.js */
import { combineReducers } from 'redux';
import myStore from '../stores/myStore';

export default combineReducers({
  // ...
  myStore: myStore.createReducer(),
});
```

3. Bind action creators
```javascript
/** app/components/AppContainer.jsx */
import { connect } from 'redux';
import App from './App';

function mapStateToProps(state) {
  // ...
}

function mapDispatchToProps(dispatch) {
  const actions = {};
  // ...
  actions.myStore = myStore.bindActionCreators(dispatch);
  return actions;
}

// ...
export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Usage
### Calling Actions
```javascript
actions.myStore.foo();
```

### Accessing the Store
```javascript
store.myStore
```

## Examples
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: { counter: 0 },
  actions: {
    increment: {
      reducer: (state) => ({
        ...state,
        counter: state.counter + 1,
      }),
    },
  },
});

// Incrementing
actions.counterStore.increment()

// Accessing Counter
store.counterStore.counter
```

# Usage
## Setup
1. Define your store
```javascript
/** app/stores/counter.js */
import { BasicStore } from '@thebasement/redux-boilerplate';

export default new BasicStore({
  name: 'counter',
  initalState: 0,
  actions: {
    increment: (state, i) => state + i,
  },
});
```

2. Create reducer for store
```javascript
/** app/reducers/index.js */
import { combineReducers } from 'redux';
import counter from '../stores/counter';

export default combineReducers({
  // ...
  counter: counter.createReducer(),
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
  actions.counter = counter.bindActionCreators(dispatch);
  return actions;
}

// ...
export default connect(mapStateToProps, mapDispatchToProps)(App);
```

## Usage
```javascript
// Calling actions
actions.counter.increment();

// Accessing the Store
store.counter // returns 1
```

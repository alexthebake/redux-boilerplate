# Getting Started

## Example
We'll start off with a basic counter store to demonstrate how the `BasicStore`
can simplify a lot of the boilerplate we're used to writing in redux.

### Setting Up the Store
If you've been using redux for a while, you might be tired of editing three
different files (or more) to implement a simple action/reducer. That process
might look something like this:

**Add a new constant**
```javascript
/** app/constants/actionTypes.js */
export const COUNTER_INCREMENT = 'COUNTER_INCREMENT';
```

**Implement action creator**
```javascript
/** app/actions/counterActions.js */
import { COUNTER_INCREMENT } from '../constants/actionTypes.js';

export function incrementCounter(i = 1) {
  return { type: COUNTER_INCREMENT, payload: i };
}
```

**Implement reducer**
```javascript
/** app/reducers/counterReducer.js */
import { COUNTER_INCREMENT } from '../constants/actionTypes.js';

function counter(state, action) {
  switch (action.type) {
    case COUNTER_INCREMENT:
      return state + action.payload;
    default:
      return state;
  }
}
```

With the `BasicStore`, we can put all of this in one place, and simplify the
connection between the action and the reducer.

```javascript
/** app/stores/counter.js */
import { BasicStore } from '@thebasement/redux-boilerplate';

export default new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state, i = 1) => state + i,
  },
});
```

The key difference is in how actions are implemented. In vanilla redux, you
need and action *and* a reducer, and they often live in separate places and
need to agree on action type.

The `BasicStore` allows you to define "updater" functions that take the current
state and any arguments for your action, and return a new state.

```javascript
/**
 * @param  {*}    state Current state in redux
 * @param  {...*} args  Array of passed arguments
 * @return {*}          New state to apply
 */
function updater(state, ...args) {
  // Possibly do something with state and args
  return state; // Return new state
}
```

# PromiseStore
The PromiseStore allows you to define promise based actions, as well as thunk
and basic actions.

## API
### `constructor`
```javascript
/**
 * @param {string} options.name         Name of store
 * @param {*}      options.initialState Initial state for store
 * @param {object} [options.actions={}] Actions to initialize store with
 */
```

### `addAction`
```javascript
/**
 * @param {string}   options.name            Name of action
 * @param {function} options.promiseCallback Callback that receives args and
 *                                           returns a promise
 * @param {function} options.loadingContext  Function that receives promise and
 *                                           args and returns context
 * @param {function} options.successContext  Function that receives response
 *                                           and args and returns context
 * @param {function} options.failureContext  Function that receives error and
 *                                           args and returns context
 * @param {function} options.loadingUpdater  Updater for loading action
 * @param {function} options.successUpdater  Updater for success action
 * @param {function} options.failureUpdater  Updater for failure action
 */
```

Promise actions rely on the promise callback. This callback must return a
promise. When invoking a promise action, it goes through the promise lifecycle,
dispatching actions along the way. This looks something like:

1. Fire promise
2. Dispatch loading action with loadingContext
3. If promise is resolved
  - Dispatch success action with response and successContext
4. If promise is rejected
  - Dispatch failure action with response and failureContext

#### Updater Functions
The updater functions are called at each step in the promise's lifecycle. They
receive data and context relevant from the promise lifecycle.

The loading updater function looks like this:
```javascript
loadingUpdater = (state, context) => newState
```

The success updater function looks like this:
```javascript
successUpdater = (state, response, context) => newState
```

The failure updater function looks like this:
```javascript
failureUpdater = (state, error, context) => newState
```

#### Context Functions
The context functions take data relevant to the promise lifecycle and the
arguments passed into the action and return some context to pass with action.

The loading context function looks like this:
```javascript
loadingContext = (promise, args = []) => loadingContextObject
```

The success context function looks like this:
```javascript
successContext = (response, args = []) => successContextObject
```

The failure context function looks like this:
```javascript
failureContext = (error, args = []) => failureContextObject
```

## Examples
### Basic Promise
```javascript
const randomPromiseStore = new PromiseStore({
  name: 'randomPromiseStore',
  initialState: { data: null },
  actions: {
    call: {
      promiseCallback: (data) => Promise.resolve(data),
      successUpdater: (state, data) => ({ ...state, data }),
    },
  },
});
```

### Async Request
```javascript
const resourceStore = new PromiseStore({
  name: 'resource',
  initialState: {
    loaded: false,
    loading: false,
    data: null,
    error: null,
  },
  actions: {
    index: {
      promiseCallback: () => axios.get('/api/resource/'),
      loadingUpdater: (state) => ({
        ...state,
        loading: true,
      }),
      successUpdater: (state, response) => ({
        ...state,
        loaded: true,
        loading: false,
        data: response.data,
      }),
      failureUpdater: (state, response) => ({
        ...state,
        loaded: true,
        loading: false,
        error: response.data,
      }),
    },
  },
});
```

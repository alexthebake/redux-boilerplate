# PromiseStore
The PromiseStore allows you to define promise based actions, as well as thunk
and basic actions.

## Examples
### Basic Promise
```javascript
const randomPromise = Promise.resolve('data');

const randomPromiseStore = new PromiseStore({
  name: 'randomPromiseStore',
  initialState: { data: null },
  actions: {
    call: {
      promiseCallback: () => randomPromise(),
      successUpdater: (state, response) => ({
        ...state,
        data: response.data,
      }),
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

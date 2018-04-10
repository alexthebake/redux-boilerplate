# BasicStore
The BasicStore allows you to define multiple action creators and reducers in
the same file.

## API
### `constructor({ name, initialState, actions = {} })`
BasicStores take an options object with the following shape:
```javascript
/**
 * @param  {string}  options.name         Name of store
 * @param  {*}       options.initialState Initial state for store
 * @param  {Object=} [options.actions={}] Actions to initialize store with
 */
```

#### Example
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
});
```

### `addAction({ name, payload = undefined, reducer })`
```javascript
/**
 * @param  {string}   options.name    Name of action
 * @param  {*=}       options.payload Payload to send with action
 * @param  {function} options.reducer Reducer to handle action
 */
```

#### Examples
**No payload**
```javascript
counterStore.addAction({
  name: 'increment',
  reducer: (state) => state + 1,
});
```
**Implicit payload**
```javascript
counterStore.addAction({
  name: 'increment',
  reducer: (state, action) => state + action.payload,
});
```
**Explicit payload**
```javascript
counterStore.addAction({
  name: 'increment',
  payload; (i = 1) => i,
  reducer: (state, action) => state + action.payload,
});
```

**Constant payload**
```javascript
counterStore.addAction({
  name: 'increment',
  payload: 1,
  reducer: (state, action) => state + action.payload,
});
```

## Usage
### Calling Actions
```javascript
actions.counter.increment()
```

### Accessing state
```javascript
store.counter
```

## Store Examples
### Simple Counter
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: {
      reducer: (state) => state + 1,
    },
  },
});
```

### Counter with Args
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: {
      payload: (i = 1) => i,
      reducer: (state, action) => state + action.payload,
    },
  },
});
```

### To-Do List
```javascript
const todoStore = new BasicStore({
  name: 'todo',
  initialState: {
    nextId: 0,
    list: []
  },
  actions: {
    addTodo: {
      payload: (message) => message,
      reducer: (state, action) => ({
        ...state,
        nextId: state.nextId + 1,
        list: [
          ...state.list,
          {
            id: state.nextId,
            message: action.payload,
            completed: false,
          }
        ],
      }),
    },
    toggleTodo: {
      payload: (id) => id,
      reducer: (state, action) => ({
        ...state,
        list: state.list.map(todo =>
          (todo.id === action.payload)
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }),
    },
  },
});
```

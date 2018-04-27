# BasicStore
BasicStore provides updater actions and thunk actions that simplify the redux
API.

## API
### `constructor`
BasicStores take an options object with the following shape:
```javascript
/**
 * @param {string} options.name         Name of store
 * @param {*}      options.initialState Initial state for store
 * @param {object} [options.actions={}] Actions to initialize store with
 */
```

#### Example
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state, i) => state + i,
  },
});
```

### `addAction`
```javascript
/**
 * @param {string}   options.name    Name of action
 * @param {function} options.updater Updater function
 */
```

The updater function looks like this:
```javascript
updater = (state, ...args) => newState;
```

When the action is invoked, are the arguments passed to the action are funneled
into the `...args` portion of the updater function and available for updating
the store's state.


#### Examples
```javascript
counterStore.addAction({
  name: 'decrement',
  updater: (state, i) => state - i,
});
```

## Store Examples
### Simple Counter
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state) => state + 1,
  },
});
```

### Counter with Args
```javascript
const counterStore = new BasicStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state, i = 1) => state + i,
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
    addTodo: (state, message) => ({
      ...state,
      nextId: state.nextId + 1,
      list: [
        ...state.list,
        {
          id: state.nextId,
          message: message,
          completed: false,
        }
      ],
    }),
    toggleTodo: (state, id) => ({
      ...state,
      list: state.list.map(todo =>
        (id === todo.id)
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    }),
  },
});
```

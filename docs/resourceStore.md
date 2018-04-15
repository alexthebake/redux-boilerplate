# ResourceStore
The ResourceStore comes with actions for various CRUD operations. It also
allows you to define promise, thunk and basic actions.

## Examples
### Basic Example
```javascript
const resourceStore = new ResourceStore({
  name: 'resource',
  endpoint: '/api/resource/'
});
```

### Adding Custom Actions
```javascript
const resourceStore = new ResourceStore({
  name: 'resource',
  endpoint: '/api/resource/',
});

resourceStore.addAxiosAction({
  name: 'special',
  request: {
    url: resourceStore.endpoint + 'special',
    method: 'POST',
  },
  dataUpdater: (state) => state.data,
});
```

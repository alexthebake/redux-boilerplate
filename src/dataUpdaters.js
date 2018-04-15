/**
 * Removes resource from store by id.
 * @param  {Object}        oldData Data currently in the store
 * @param  {Number|String} id      ID of resource to be removed
 * @return {Object}                oldData with given resource removed by id
 */
export function removeById(oldData, id) {
  const data = { ...oldData };
  _.unset(data, id);
  return data;
}

/**
 * Unions data in the store with new data from the server by id.
 * @param  {Object} oldData Data currently in the store
 * @param  {Array}  newData Array of new data from the server
 * @return {Object}         oldData with new data overwriting by id
 */
export function unionById(oldData, newData, key = 'id') {
  const data = { ...oldData };
  _.forEach(newData, (resource) => {
    data[resource[key]] = resource;
  });
  return data;
}

/**
 * Adds a singluar resource to data by id.
 * @param  {Object} oldData  Data currently in the store
 * @param  {Object} resource Singular resource from the server
 * @return {Object}          oldData with resource overwriting by id
 */
export function addOrUpdateById(oldData, resource, key = 'id') {
  return unionById(oldData, [resource], key);
}

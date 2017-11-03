export function removeById(oldData, id) {
  const data = { ...oldData };
  _.unset(data, id);
  return data;
}

export function unionById(oldData, newData) {
  const data = { ...oldData };
  _.forEach(newData, (resource) => {
    data[resource.id] = resource;
  });
  return data;
}

export function addOrUpdateById(oldData, resource) {
  return unionById(oldData, [resource]);
}

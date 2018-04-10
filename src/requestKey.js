export default function requestKey({ url, data = {}, method = 'GET' }) {
  const dataString = JSON.stringify(data);
  return `${method} ${url}?${dataString}`;
}

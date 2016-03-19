function array() {
  return Promise.resolve([]);
}

function single() {
  return Promise.resolve({});
}

export default {array, single};

const actionCreator = function (type) {
  return (_object = {}) => ({
    type,
    ..._object,
  });
}

const fullURL = endPoint => `${env.backendURL}${endPoint}`

export {
    actionCreator,
    fullURL,
}

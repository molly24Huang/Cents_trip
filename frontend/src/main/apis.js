import * as Cookies from 'cookiejs'
import _ from 'lodash'
import { fullURL } from 'main/util'

const defaultHandler = response => response.json().then(json =>
  ({ success: response.status===200, data: json }));

const getInit = {
      method: 'GET',
      mode: env.corsMode,
      cache: 'default',
      credentials: 'include',
    }

const postInit = {
      method: 'POST',
      mode: env.corsMode,
      cache: 'default',
      credentials: 'include',
    }

const requestGet =
      (apiPath, data = {}) =>
        (handler) => {
          handler = handler || defaultHandler
          const url = new URL(fullURL(apiPath));
          const serachParams = new URLSearchParams();
          _.forEach(Object.keys(data), key => {
            serachParams.append(key, data[key]);
          })
          url.search = serachParams.toString();
          return fetch(url.toString(), getInit)
                  .then(res => handler(res))
                  .catch(e => ({ success: false, error: e }));
    }

const requestPost =
      (apiPath, data = {}) =>
        (handler) => {
          handler = handler || defaultHandler
          const url = new URL(fullURL(apiPath))
          return fetch(url.toString(), {
             ...postInit,
             headers: new Headers({...env.headers, 'X-CSRFToken': Cookies.get('csrftoken') }),
             body: JSON.stringify(data)
          }).then(res=>handler(res)).catch(e =>({success: false, error: e}))
        }

export {
    requestGet,
    requestPost,
};

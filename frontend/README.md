CENTS-TRIP
=========

Install dependencies via `yarn`
------------------------------
Regarding yarn, please refer to [`yarn`](https://yarnpkg.com/en/docs/install)

```
yarn install
```

Start dev server
---------------
Using webpack-dev-server for local development.

```
yarn start
```

Open browser and type **127.0.0.1:3000** to go to home page.

**NOTE**
- When editing `.jsx`,`.js` or `.sass` files, refreshing the browser can make all changes take effect.
- When editing `.yaml` fileis, you should restart the server to make changes work.
```
#stop server: ctrl-c
#and then
yarn start
```

Deploy the code
--------------
Using webpack to bundle all files when deploy the frontend code to IBM Bluemix server.

```
yarn start prod
```



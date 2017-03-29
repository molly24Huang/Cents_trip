if [ -z "$1" ]; then
  _env="dev"
else
  _env=$1
fi

if [ $_env = "dev" ]; then
  node server.js
elif [ $_env = 'prod' ]; then
  webpack --colors --progress --display-error-details --env prod
elif [ $_env = 'test' ]; then
  webpack --colors --progress --display-error-details --env test
else
  echo 'unknown env'
fi

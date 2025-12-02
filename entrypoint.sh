#!/bin/sh
set -e

sed "s|{{API_URL}}|$API_URL|g"  /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html

exec "$@"
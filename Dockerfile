FROM nginx:alpine

RUN apk add --no-cache gettext-base

COPY index.html /usr/share/nginx/html/index.html.template
COPY . /usr/share/nginx/html/

COPY entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
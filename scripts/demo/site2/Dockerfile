FROM busybox:latest
COPY index.html /www/index.html
EXPOSE 8080
CMD ["busybox", "httpd", "-f", "-v", "-p", "8080", "-h", "/www"]
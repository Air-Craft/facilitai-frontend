FROM nginx:alpine

# Remove the default configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d

COPY . /usr/share/nginx/html
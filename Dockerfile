# Use a very small, efficient Nginx base image
FROM nginx:alpine

# Copy all files from your current directory into the Nginx default serving directory
COPY . /usr/share/nginx/html

# Uses the Ruby version compatible with  Github Pages
FROM ruby:3.3-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install Jekyll dependencies
RUN apk add --no-cache build-base nodejs
COPY Gemfile* ./
RUN bundle install

# Copy the rest of the application source code
COPY . .

# Command to build the site and serve it locally for testing
# Note: GitHub Actions will typically just run the 'build' command themselves
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]

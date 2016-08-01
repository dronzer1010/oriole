FROM ubuntu:14.04

RUN echo 'deb http://security.ubuntu.com/ubuntu trusty-security main' | sudo tee -a /etc/apt/sources.list
RUN sudo apt-get update
RUN sudo apt-get install linux-libc-dev nodejs npm git-core krb5-multidev libkrb5-dev -y
RUN sudo ln -s /usr/bin/nodejs /usr/bin/node
RUN sudo npm install -g bower -y
RUN sudo npm install -g gulp -y
RUN sudo npm install -g pm2 -y

RUN mkdir /root/web
COPY . /root/web
RUN cd /root/web; sudo npm install; sudo bower install --allow-root; gulp clean-build-app-prod

EXPOSE 3000

CMD cd /root/web; NODE_ENV=production node server.js

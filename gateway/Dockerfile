FROM node

RUN mkdir -p /home/app
RUN yarn
COPY . /home/app
EXPOSE 5000
CMD ["node", "/home/app/app.js"]
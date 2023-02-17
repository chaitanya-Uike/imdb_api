class RequestManager {
  listeners = {};

  on(correlationId, handler) {
    this.listeners[correlationId] = handler;
  }

  dispatch(correlationId, res) {
    if (this.listeners[correlationId]) {
      this.listeners[correlationId](res);
      delete this.listeners[correlationId];
    }
  }
}

module.exports = RequestManager;

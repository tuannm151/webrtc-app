export class WebsocketClient {
  constructor(connectionUrl) {
    this.socket = new WebSocket(connectionUrl);
    this.events = {};

    this.socket.onclose = () => {
      console.log('Websocket connection closed');
    };

    this.socket.onopen = () => {
      console.log('Websocket connection opened');
      if (this.isConnected()) {
        this.onConnected();
        this._heartbeat();
      }
    };
    this.socket.onerror = (error) => {
      console.error('Websocket error. Closing socket', error);
      this.socket.close();
    };
    window.onbeforeunload = () => {
      this.socket.onclose = () => {};
      this.socket.close();
    };

    this.socket.onmessage = (message) => {
      const wsMessage = JSON.parse(message.data);
      const data = JSON.parse(wsMessage.Data);
      const { ActionType } = wsMessage;

      // find the event handler for this message type
      const eventHandler = this.events[ActionType];
      if (!eventHandler) {
        return;
      }

      eventHandler(wsMessage, data);
    };
  }
  onConnected() {}
  isConnected() {
    return this.socket.readyState === WebSocket.OPEN;
  }
  on(event, callback) {
    this.events[event] = callback;
  }
  close() {
    this.socket.close();
  }

  send(data) {
    try {
      if (!this.isConnected()) {
        throw new Error('Websocket not connected');
      }
      this.socket.send(JSON.stringify(data));
      console.log(JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }
  join(socketGroupName, secret, data) {
    this.send({
      ActionType: 'JoinGroup',
      GroupName: socketGroupName,
      GroupSecret: secret,
      Data: JSON.stringify(data),
    });
  }
  _heartbeat() {
    if (!this.isConnected()) {
      console.log('Websocket not connected. Skipping heartbeat');
      return;
    }
    this.send({
      ActionType: 'Heartbeat',
    });
    const INTERVAL_TIME = 90 * 1000; // 90 seconds
    setTimeout(this._heartbeat.bind(this), INTERVAL_TIME);
  }
}

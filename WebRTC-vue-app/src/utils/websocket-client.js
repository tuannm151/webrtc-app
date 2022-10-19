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
      }
    };
    this._heartbeat();

    this.socket.onmessage = (message) => {
      const wsMessage = JSON.parse(message.data);
      const data = JSON.parse(wsMessage.Data);
      console.log(wsMessage, data);
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

  send(data) {
    try {
      if (!this.isConnected()) {
        throw new Error('Websocket not connected');
      }
      this.socket.send(JSON.stringify(data));
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
      return;
    }
    this.send({
      ActionType: 'Heartbeat',
    });
    const INTERVAL_TIME = 99 * 1000; // 90 seconds
    setTimeout(this._heartbeat, INTERVAL_TIME);
  }
}

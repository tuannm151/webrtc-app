export class WebsocketClient {
  constructor(connectionUrl) {
    this.socket = new WebSocket(connectionUrl);
    this.socket.onclose = () => {
      console.log('Websocket connection closed');
    };
  }
  isConnected() {
    return this.socket.readyState === WebSocket.OPEN;
  }

  send(data) {
    if (!this.isConnected()) {
      throw new Error('Websocket not connected');
    }
    this.socket.send(JSON.stringify(data));
  }
  join(socketGroupName, secret, data) {
    this.send({
      ActionType: 'JoinGroup',
      GroupName: socketGroupName,
      GroupSecret: secret,
      Data: JSON.stringify(data),
    });
  }
}

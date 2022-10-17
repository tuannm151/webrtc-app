import { WebsocketClient } from './websocket-client';

export default class WebRTCConnection extends WebsocketClient {
  constructor(connectionUrl) {
    super(connectionUrl);
    this.pc = new RTCPeerConnection();
    this.socket.onmessage = (message) => {
      const wsMessage = JSON.parse(message.data);
      console.log(wsMessage);
      if (wsMessage.ActionType === 'Offer') {
        this.pc.setRemoteDescription(wsMessage.UserData.data);
        this._sendAnswer(wsMessage.SourceId, wsMessage);
      }
      if (wsMessage.ActionType === 'Answer') {
        this.pc.setRemoteDescription(wsMessage.UserData.data);
      }
      if (wsMessage.ActionType === 'Connected') {
        this._sendOffer(
          wsMessage.SourceId,
          wsMessage.DestId,
          wsMessage.UserData
        );
      }
      if (wsMessage.ActionType === 'Disconnected') {
        console.log(`Disconnected from ${wsMessage.SourceId}`);
      }
    };
  }
  joinRoom(roomName, secret, data) {
    this.join(roomName, secret, data);
  }
  _sendOffer(sourceId, destId, data) {
    this.pc.createOffer().then((offer) => {
      this.pc.setLocalDescription(offer);
      this.send({
        ActionType: 'Offer',
        DestId: destId,
        UserData: data,
        SourceId: sourceId,
      });
    });
  }
  _sendAnswer(destId, data) {
    this.pc.createAnswer().then((answer) => {
      this.pc.setLocalDescription(answer);
      this.send({
        ActionType: 'Answer',
        DestId: destId,
        UserData: data,
      });
    });
  }
}

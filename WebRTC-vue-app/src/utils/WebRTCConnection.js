import { WebsocketClient } from './websocket-client';

export default class WebRTCConnection extends WebsocketClient {
  constructor(connectionUrl, userData) {
    super(connectionUrl);
    this.pc = new RTCPeerConnection();
    this.userData = userData;

    this.socket.onopen = () => {
      if (super.isConnected()) {
        this.onConnected();
        this.socket.onmessage = (message) => {
          const wsMessage = JSON.parse(message.data);
          const data = JSON.parse(wsMessage.Data);

          if (wsMessage.ActionType === 'Offer') {
            console.log(`Received offer from ${data.userName}`);
            this.pc.setRemoteDescription(data.sdp);
            this._sendAnswer(wsMessage.SourceId, userData);
          }
          if (wsMessage.ActionType === 'Answer') {
            console.log(`Received answer from ${data.userName}`);
            this.pc.setRemoteDescription(data.sdp);
          }
          if (wsMessage.ActionType === 'Connected') {
            console.log(`${data.userName} joined the room`);
            this._sendOffer(wsMessage.SourceId, userData);
          }
          if (wsMessage.ActionType === 'Disconnected') {
            console.log(`Disconnected from ${wsMessage.SourceId}`);
          }
          console.log(data);
        };
      }
    };
  }
  onConnected() {}
  joinRoom(roomName, secret) {
    this.join(roomName, secret, this.userData);
  }
  _sendOffer(destId, data) {
    this.pc.createOffer().then((offer) => {
      this.pc.setLocalDescription(offer);
      this.send({
        ActionType: 'Offer',
        DestId: destId,
        Data: JSON.stringify({
          ...data,
          sdp: offer,
        }),
      });
    });
  }
  _sendAnswer(destId, data) {
    this.pc.createAnswer().then((answer) => {
      this.pc.setLocalDescription(answer);
      this.send({
        ActionType: 'Answer',
        DestId: destId,
        Data: JSON.stringify({
          ...data,
          sdp: answer,
        }),
      });
    });
  }
}

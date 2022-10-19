export default class WebRTCConnection {
  constructor(pc, wsConnection, userData) {
    this.pc = pc;
    this.wsConn = wsConnection;
    this.userData = userData;

    this.wsConn.on('Offer', (message) => {
      const data = JSON.parse(message.Data);
      console.log(`Received offer from ${data.userName}`);
      this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      this._sendAnswer(message.SourceId, this.userData);
    });
    this.wsConn.on('Answer', (message) => {
      const data = JSON.parse(message.Data);
      console.log(`Received answer from ${data.userName}`);
      this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });
    this.wsConn.on('ConnectRTC', (message) => {
      // check if there an existing connection
      console.log('Received connect request');
      this._sendOffer(message.SourceId, this.userData);
    });
    this.wsConn.on('IceCandidate', async (message) => {
      try {
        const data = JSON.parse(message.Data);
        console.log(`Received candidate from ${data.userName}`);
        await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });
  }

  connectRTC() {
    if (this.pc.signalingState !== 'stable') return;
    this.wsConn.send({
      ActionType: 'ConnectRTC',
      Data: JSON.stringify(this.userData),
    });
  }
  _sendOffer(destId, data) {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending candidate');
        this.wsConn.send({
          ActionType: 'IceCandidate',
          DestId: destId,
          Data: JSON.stringify({
            ...this.userData,
            candidate: event.candidate,
          }),
        });
      }
    };
    this.pc.createOffer().then((offer) => {
      this.pc.setLocalDescription(offer);
      console.log('offer');
      this.wsConn.send({
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
      this.pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending candidate');
          this.wsConn.send({
            ActionType: 'IceCandidate',
            DestId: destId,
            Data: JSON.stringify({
              ...this.userData,
              candidate: event.candidate,
            }),
          });
        }
      };
      this.pc.setLocalDescription(answer);
      this.wsConn.send({
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

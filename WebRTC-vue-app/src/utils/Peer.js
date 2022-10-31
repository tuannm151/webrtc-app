const configuration = {
  iceServers: [
    {
      urls: 'stun:openrelay.metered.ca:80',
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

export default class Peer {
  constructor(wsConn, { destId, isSender, clientData }) {
    this.pc = new RTCPeerConnection(configuration);
    this.makingOffer = false;
    this.id = destId;
    this.polite = isSender;
    this.wsConn = wsConn;
    this.dc = null;
    this.audioOn = false;
    this.videoOn = false;
    this.clientData = clientData;

    if (isSender) {
      this.dc = this.pc.createDataChannel('chat');
      this.dc.onopen = () => {
        this.onChannelOpen();
      };
      this.dc.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
        const { type, data } = message;
        if (type === 'connection') {
          this.gotMessage(data);
        } else if (type === 'action-media') {
          if (data.type === 'audio') {
            this.audioOn = data.active;
          }
          if (data.type === 'video') {
            this.videoOn = data.active;
          }
          this.onMediaStateChange(data);
        }
      };
    }

    this.pc.ondatachannel = (event) => {
      this.dc = event.channel;
      this.dc.onopen = () => {
        this.onChannelOpen();
      };
      this.dc.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
        const { type, data } = message;
        if (type === 'connection') {
          this.gotMessage(data);
        } else if (type === 'action-media') {
          if (data.type === 'audio') {
            this.audioOn = data.active;
          }
          if (data.type === 'video') {
            this.videoOn = data.active;
          }
          this.onMediaStateChange(data);
        }
      };
    };

    this.pc.ontrack = (event) => {
      if (event.track.kind === 'audio') {
        this.audioOn = true;
      }
      if (event.track.kind === 'video') {
        this.videoOn = true;
      }
      const [stream] = event.streams;
      this.gotStream({
        stream,
        trackType: event.track.kind,
      });
    };

    this.pc.onnegotiationneeded = async () => {
      try {
        if (this.makingOffer) {
          console.log('is already making offer');
          return;
        }
        this.makingOffer = true;
        await this.pc.setLocalDescription();
        console.log(`Sending sdp on negotiation needed`);
        this._sendConnectionData({ sdp: this.pc.localDescription });
      } catch (err) {
        console.error(err);
      } finally {
        this.makingOffer = false;
      }
    };
    this.pc.onicecandidate = (event) => {
      console.log('Sending candidate');

      this._sendConnectionData({ candidate: event.candidate });
    };
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc.iceConnectionState === 'failed') {
        console.log('Ice connection failed. Restart Ice');
        this.pc.restartIce();
      }
    };
    // if (this.polite) {
    //   console.log('Initiating negotiation');
    //   this._sendOffer(id);
    // }
  }

  onMediaStateChange() {}

  onChannelOpen() {}

  isChannelOpen() {
    return this.dc && this.dc.readyState === 'open';
  }
  gotMessage = async ({ sdp, candidate }) => {
    try {
      if (sdp) {
        const offerCollision =
          sdp.type === 'offer' &&
          (this.makingOffer || this.pc.signalingState !== 'stable');
        const ignoreOffer = !this.polite && offerCollision;
        if (ignoreOffer) {
          console.log('Ignoring offer');
          return;
        }
        console.log(`received sdp: ${sdp.type}`);
        await this.pc.setRemoteDescription(sdp);
        if (sdp.type === 'offer') {
          await this.pc.setLocalDescription();
          console.log(`Sending sdp: ${this.pc.localDescription.type}`);
          this._sendConnectionData({ sdp: this.pc.localDescription });
        }
      } else if (candidate) {
        try {
          console.log('Received candidate');
          await this.pc.addIceCandidate(candidate);
        } catch (err) {
          if (!this.ignoreOffer) {
            console.error(err);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  close() {
    this.pc.close();
  }

  _sendConnectionData = (data) => {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify({ type: 'connection', data }));
    } else {
      this.wsConn.send({
        ActionType: 'Negotiate',
        DestId: this.id,
        Data: JSON.stringify({
          ...data,
          clientData: this.clientData,
        }),
      });
    }
  };

  sendMessageChannel = (message) => {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify(message));
    }
  };

  startStream = async (localStream) => {
    localStream.getTracks().forEach((track) => {
      this.pc.addTrack(track, localStream);
    });
  };
  _sendOffer = async (destId) => {
    try {
      this.makingOffer = true;
      const offer = await this.pc.createOffer({
        offerToReceiveVideo: true,
      });
      await this.pc.setLocalDescription(offer);

      this.wsConn.send({
        ActionType: 'Negotiate',
        DestId: destId,
        Data: JSON.stringify({ sdp: this.pc.localDescription }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.makingOffer = false;
    }
  };
  gotStream = () => {};
}

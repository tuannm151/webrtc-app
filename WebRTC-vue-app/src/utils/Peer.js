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
  constructor(wsConn, { destId, polite, localStream }) {
    this.pc = new RTCPeerConnection(configuration);
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.destId = destId;
    this.polite = polite;
    this.wsConn = wsConn;

    if (localStream) {
      console.log('Adding local stream...');
      localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, localStream);
      });
    }

    this.pc.ontrack = (event) => {
      const [stream] = event.streams;
      this.gotStream(stream);
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
        wsConn.send({
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
    this.pc.onicecandidate = (event) => {
      console.log('Sending candidate');
      this.wsConn.send({
        ActionType: 'Negotiate',
        DestId: destId,
        Data: JSON.stringify({ candidate: event.candidate }),
      });
    };
    this.pc.oniceconnectionstatechange = () => {
      if (this.pc.iceConnectionState === 'failed') {
        console.log('Ice connection failed. Restart Ice');
        this.pc.restartIce();
      }
    };
    // if (this.polite) {
    //   console.log('Initiating negotiation');
    //   this._sendOffer(destId);
    // }
  }
  onMessage = async ({ sdp, candidate }) => {
    try {
      if (sdp) {
        const offerCollision =
          sdp.type === 'offer' &&
          (this.makingOffer || this.pc.signalingState !== 'stable');
        this.ignoreOffer = !this.polite && offerCollision;
        if (this.ignoreOffer) {
          console.log('Ignoring offer');
          return;
        }
        console.log(`received sdp: ${sdp.type}`);
        await this.pc.setRemoteDescription(sdp);
        if (sdp.type === 'offer') {
          await this.pc.setLocalDescription();
          console.log(`Sending sdp: ${this.pc.localDescription.type}`);
          this.wsConn.send({
            ActionType: 'Negotiate',
            DestId: this.destId,
            Data: JSON.stringify({ sdp: this.pc.localDescription }),
          });
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

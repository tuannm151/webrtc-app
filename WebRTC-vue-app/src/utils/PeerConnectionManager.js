import Peer from './Peer';

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
export default class PeerConnectionManager {
  constructor(wsConnection) {
    this.peers = {};
    this.wsConn = wsConnection;
    this.localStream = null;

    // khởi tạo một kết nối p2p khi một user kết nối vào room
    this.wsConn.on('Connected', async (message, data) => {
      console.log('Connected', `${data.userName} joined`);

      const senderSocketId = message.SourceId;
      // await this._initPeers(senderSocketId);
      // gửi offer cho user mới kết nối vào room

      // this._sendOffer(senderSocketId);
      const peer = new Peer(this.wsConn, {
        destId: senderSocketId,
        polite: true,
        localStream: this.localStream,
      });
      peer.gotStream = (stream) => {
        this.onStreamChange(stream, senderSocketId);
      };

      this.peers[senderSocketId] = peer;
    });

    this.wsConn.on('Negotiate', async (message, data) => {
      const senderSocketId = message.SourceId;
      this.peers[senderSocketId].onMessage(data);
    });

    this.wsConn.on('Joined', async (_, data) => {
      const socketIds = data;
      socketIds.forEach(async (socketId) => {
        const peer = new Peer(this.wsConn, {
          destId: socketId,
          polite: false,
          localStream: this.localStream,
        });
        peer.gotStream = (stream) => {
          console.log('gotStream', stream);
          this.onStreamChange(stream, socketId);
        };
        this.peers[socketId] = peer;
      });
    });

    // khi một user disconnect close peer connection
    this.wsConn.on('Disconnected', (message) => {
      console.log('Disconnected', message.SourceId);
      if (this.peers[message.SourceId]) {
        this.peers[message.SourceId].close();
        delete this.peers[message.SourceId];
      }
      this.onStreamChange(null, message.SourceId);
    });

    // khi nhận được offer từ user khác
    this.wsConn.on('Offer', (message) => {
      const data = JSON.parse(message.Data);
      console.log('Received Offer');
      const senderSocketId = message.SourceId;
      this._initPeers(senderSocketId);
      this.peers[senderSocketId].setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );

      // gửi answer lại cho user vừa offer
      console.log('Sending answer');
      this._sendAnswer(message.SourceId);
    });

    // khi nhận được answer từ user khác
    this.wsConn.on('Answer', (message) => {
      console.log('Received Answer');
      const data = JSON.parse(message.Data);

      const pc = this.peers[message.SourceId];
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    // khi nhận được candidate từ user khác

    this.wsConn.on('IceCandidate', async (message) => {
      console.log('Received candidate');
      const pc = this.peers[message.SourceId];
      try {
        const data = JSON.parse(message.Data);

        // add candidate vào peer connection
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });
  }
  async onStreamChange() {}

  openLocalMedia = async () => {
    try {
      this.localStream = await this.getUserMedia();
      Object.values(this.peers).forEach((peer) => {
        peer.startStream(this.localStream);
      });

      return this.localStream;
    } catch (e) {
      console.error('Error opening local media', e);
    }
  };
  _initPeers = async (senderSocketId) => {
    try {
      console.log(this);
      const pc = new RTCPeerConnection(configuration);

      this.peers[senderSocketId] = pc;
      this.peers[senderSocketId].onicecandidate = (event) => {
        if (event.candidate) {
          this._sendIceCandidate(senderSocketId, event.candidate);
        }
      };
      pc.onnegotiationneeded = async () => {
        console.log('onnegotiationneeded');
      };
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream);
        });
      }

      pc.ontrack = (event) => {
        console.log('received track');
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        this.onStreamChange(senderSocketId, remoteStream);
      };
      // await this.openLocalMedia();
    } catch (err) {
      console.log(err);
    }
  };
  onFinishInit = () => {};
  _sendIceCandidate = (destId, candidate) => {
    console.log('Sending candidate');
    this.wsConn.send({
      ActionType: 'IceCandidate',
      DestId: destId,
      Data: JSON.stringify({
        candidate: candidate,
      }),
    });
  };

  _sendOffer = async (destId) => {
    const pc = this.peers[destId];
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    pc.setLocalDescription(offer);
    this.wsConn.send({
      ActionType: 'Negotiate',
      DestId: destId,
      Data: JSON.stringify({
        sdp: offer,
      }),
    });
  };
  _sendAnswer = async (destId) => {
    const pc = this.peers[destId];
    const answer = await pc.createAnswer();
    pc.setLocalDescription(answer);
    this.wsConn.send({
      ActionType: 'Answer',
      DestId: destId,
      Data: JSON.stringify({
        sdp: answer,
      }),
    });
  };
  getUserMedia = async () => {
    const constraints = {
      audio: { echoCancellation: true },
      video: {
        width: { min: 640, ideal: 800, max: 1280 },
        height: { min: 480, ideal: 600, max: 720 },
      },
    };
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  };
}

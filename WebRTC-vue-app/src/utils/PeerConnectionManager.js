import Peer from './Peer';
export default class PeerConnectionManager {
  constructor(wsConnection, clientData) {
    this.connections = {};
    this.wsConn = wsConnection;
    this.localVideoStream = null;
    this.localAudioStream = null;
    this.localShareStream = [];
    this.dc = null;
    this.clientData = clientData;

    // khởi tạo một kết nối p2p khi một user kết nối vào room
    this.wsConn.on('Connected', async (message, payload) => {
      console.log('Connected', `${payload.UserName} joined`);

      const senderSocketId = message.SourceId;
      // await this._initPeers(senderSocketId);
      // gửi offer cho user mới kết nối vào room

      const peer = this._initPeer({
        socketId: senderSocketId,
        isSender: true,
        clientData,
      });
      this.onConnection({ id: senderSocketId, data: payload });
      this.connections[senderSocketId] = { peer, clientData: payload };
    });

    this.wsConn.on('Negotiate', async (message, payload) => {
      const senderSocketId = message.SourceId;
      const { clientData: remoteClientData } = payload;
      if (!this.connections[senderSocketId]) {
        const peer = this._initPeer({
          socketId: senderSocketId,
          isSender: false,
          clientData,
        });
        this.connections[senderSocketId] = { peer };
      }
      if (!this.connections[senderSocketId].clientData) {
        this.connections[senderSocketId].clientData = remoteClientData;
        this.onConnection({ id: senderSocketId, data: remoteClientData });
      }
      this.connections[senderSocketId].peer.gotConnectionMessage(payload);
    });

    // khi một user disconnect close peer connection
    this.wsConn.on('Disconnected', (message) => {
      console.log('Disconnected', message.SourceId);
      if (this.connections[message.SourceId]) {
        this.connections[message.SourceId].peer.close();
        delete this.connections[message.SourceId];
      }
      this.onPeerDestroyed(message.SourceId);
    });

    this.wsConn.on('JoinGroup', (payload) => {
      const { type, message } = payload;
      if (type === 'error') {
        this.onJoinGroupFailed(message);
      }
    });

    this.wsConn.on('ChatMessage', (message, payload) => {
      const senderSocketId = message.SourceId;
      this.onReceivedChatMessage({ id: senderSocketId, data: payload });
    });

    this.wsConn.on('MediaState', (message, payload) => {
      const senderSocketId = message.SourceId;
      const { type, data } = payload;
      this.onMediaMessage({ socketId: senderSocketId, type, data });
    });
  }

  onConnection = () => { };
  onPeerStateChange = () => { };
  onPeerDestroyed = () => { };
  onGotScreenStream = () => { };
  onRemoteStartStream = () => { };
  onRemoteStopStream = () => { };
  onStopSharingStream = () => { };
  onReceivedChatMessage = () => { };
  onJoinGroupFailed = () => { };

  sendToAllChannels = (message) => {
    Object.values(this.connections).forEach(({ peer }) => {
      peer.sendMessageChannel(message);
    });
  };

  sendToAllSockets = (message) => {
    this.wsConn.send(message);
  };

  sendMediaState = (state) => {
    this.sendToAllSockets({
      ActionType: 'MediaState',
      Data: JSON.stringify(state),
    });
  };

  onMediaMessage = ({ type, data, socketId }) => {
    const peer = this.getPeer(socketId);

    if (!peer) {
      console.error('No peer found for socketId', socketId);
      return;
    }
    if (type === 'action-media') {
      const mediaState = {};
      if (data.type === 'audio') {
        mediaState.audioOn = data.active;
      }
      if (data.type === 'video') {
        mediaState.videoOn = data.active;
      }
      this.onPeerStateChange(socketId, mediaState);
    }

    if (type === 'action-stream') {
      const { streamId, type: action } = data;
      if (action === 'start') {
        peer.shareStreamIds.push(streamId);
        this.onRemoteStartStream({ socketId, streamId });
      }
      if (action === 'request') {
        console.log('received request stream', streamId);
        const stream = this.localShareStream.find(
          (stream) => stream.id === streamId
        );
        if (!stream) return;
        console.log('start sending stream', streamId);
        peer.startStream(stream);
      }
      if (action === 'stop') {
        this.onRemoteStopStream({ socketId, streamId });
      }
      if (action === 'request-stop') {
        // check if stream is exist in localShareStream
        const stream = this.localShareStream.find(
          (stream) => stream.id === streamId
        );
        if (stream) {
          console.log('stop sending stream', streamId);
          peer.stopStream(stream);
        }
      }
    }
  };

  getPeer = (socketId) => {
    return this.connections[socketId]?.peer;
  };

  closeAllPeers = () => {
    Object.values(this.connections).forEach(({ peer }) => {
      peer.close();
    });
  };

  _initPeer = ({ socketId, isSender, clientData }) => {
    const peer = new Peer(this.wsConn, {
      destId: socketId,
      isSender,
      clientData,
    });
    peer.onChannelOpen = () => {
      if (this.localAudioStream) {
        peer.startStream(this.localAudioStream);
      }
      if (this.localVideoStream) {
        peer.startStream(this.localVideoStream);
      }
      this.localShareStream.forEach((stream) => {
        peer.sendMessageChannel({
          type: 'action-stream',
          data: {
            type: 'start',
            streamId: stream.id,
            notification: false,
          },
        });
      });
    };

    peer.gotPeerMessage = (message) => {
      const { type, data } = message;
      if (type.startsWith('action')) {
        this.onMediaMessage({ socketId, type, data });
      }
    };

    peer.gotStream = ({ stream, trackType }) => {
      if (peer.shareStreamIds.includes(stream.id)) {
        console.log('got screen stream', stream.id);
        this.onGotScreenStream({ id: socketId, stream });
        return;
      }
      const newState = {};
      if (trackType === 'audio') {
        newState.audioOn = true;
        newState.audioStream = stream;
      }
      if (trackType === 'video') {
        newState.videoOn = true;
        newState.videoStream = stream;
      }

      this.onPeerStateChange(socketId, newState);
    };
    return peer;
  };

  requestScreen = ({ socketId, streamId }) => {
    this.connections[socketId].peer.sendMessageChannel({
      type: 'action-stream',
      data: {
        type: 'request',
        streamId,
      },
    });
  };
  requestStopScreen = ({ socketId, streamId }) => {
    this.connections[socketId].peer.sendMessageChannel({
      type: 'action-stream',
      data: {
        type: 'request-stop',
        streamId,
      },
    });
  };

  startSharingScreen = async () => {
    // capture screen
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',
      },
      audio: true,
    });
    this.sendMediaState({
      type: 'action-stream',
      data: {
        type: 'start',
        streamId: stream.id,
        notification: true,
      },
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        // handle sharing forced stop by user at browser popup.
        console.log('track stop sharing stream', stream.id);
        this.stopSharingStream(stream.id);
      };
    });

    this.localShareStream.push(stream);
    return stream;
  };

  stopSharingStream = (streamId) => {
    const stream = this.localShareStream.find(
      (stream) => stream.id === streamId
    );
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    this.localShareStream = this.localShareStream.filter(
      (stream) => stream.id !== streamId
    );
    this.sendMediaState({
      type: 'action-stream',
      data: {
        type: 'stop',
        streamId: stream.id,
        notification: true,
      },
    });
    console.log('stop sharing stream', streamId);
    this.onStopSharingStream(streamId);
  };

  openLocalMedia = async (data) => {
    const { type, deviceId } = data;
    const localStream = await this.getUserMedia({
      type,
      deviceId,
    });
    localStream.type = screen;
    Object.values(this.connections).forEach(({ peer }) => {
      peer.startStream(localStream);
    });

    if (type === 'video') {
      this.localVideoStream = localStream;
    }
    if (type === 'audio') {
      this.localAudioStream = localStream;
    }

    return localStream;
  };
  closeLocalMedia = async (type) => {
    if (type === 'video') {
      if (!this.localVideoStream) {
        return;
      }
      this.localVideoStream.getTracks().forEach((track) => track.stop());
      this.localVideoStream = undefined;
      this.sendMediaState({
        type: 'action-media',
        data: {
          type: 'video',
          active: false,
        },
      });
    }
    if (type === 'audio') {
      if (!this.localAudioStream) {
        return;
      }
      this.localAudioStream.getTracks().forEach((track) => track.stop());
      this.localAudioStream = undefined;
      this.sendMediaState({
        type: 'action-media',
        data: {
          type: 'audio',
          active: false,
        },
      });
    }
  };

  getUserMedia = async (data) => {
    const { type, deviceId } = data;
    let constraints = {};
    if (type === 'audio') {
      constraints = {
        audio: {
          deviceId,
        },
      };
    } else if (type === 'video') {
      constraints = {
        video: {
          deviceId,
        },
      };
    }
    console.log(constraints);
    return await navigator.mediaDevices.getUserMedia(constraints);
  };
}

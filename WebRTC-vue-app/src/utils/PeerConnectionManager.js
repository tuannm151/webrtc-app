import Peer from './Peer';
export default class PeerConnectionManager {
  constructor(wsConnection, userData) {
    this.connections = {};
    this.wsConn = wsConnection;
    this.localVideoStream = null;
    this.localAudioStream = null;
    this.dc = null;
    this.userData = userData;

    // khởi tạo một kết nối p2p khi một user kết nối vào room
    this.wsConn.on('Connected', async (message, data) => {
      console.log('Connected', `${data.UserName} joined`);

      const senderSocketId = message.SourceId;
      // await this._initPeers(senderSocketId);
      // gửi offer cho user mới kết nối vào room

      this._initPeer({
        socketId: senderSocketId,
        data,
        polite: true,
        newChannel: true,
      });
      this.onNewClientConnected();
    });

    this.wsConn.on('Negotiate', async (message, data) => {
      const senderSocketId = message.SourceId;
      this.connections[senderSocketId].peer.onMessage(data);
    });

    this.wsConn.on('Joined', async (message, data) => {
      const socketDatas = data;

      this.MySocketId = message.SourceId;

      socketDatas.forEach(async (data) => {
        const { SocketId } = data;
        this._initPeer({
          socketId: SocketId,
          data,
          polite: false,
          newChannel: false,
        });
      });
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
  }
  async onStreamChange() {}

  sendToAllChannels = (message) => {
    Object.values(this.connections).forEach(({ peer }) => {
      peer.sendMessageChannel(message);
    });
  };

  onConnection = () => {};
  onPeerStateChange = () => {};
  onPeerDestroyed = () => {};
  onNewClientConnected = () => {};
  _initPeer = async ({ socketId, polite, data, newChannel }) => {
    const peer = new Peer(this.wsConn, {
      destId: socketId,
      polite,
      newChannel,
    });
    if (this.localAudioStream) {
      peer.startStream(this.localAudioStream);
    }
    if (this.localVideoStream) {
      peer.startStream(this.localVideoStream);
    }
    this.onConnection({
      id: socketId,
      data,
    });
    peer.gotStream = ({ stream }) => {
      this.onPeerStateChange(socketId, {
        stream,
        videoOn: peer.videoOn,
        audioOn: peer.audioOn,
      });
    };
    peer.onMediaStateChange = () => {
      console.log('onMediaStateChange');
      console.log({
        videoOn: peer.videoOn,
        audioOn: peer.audioOn,
      });
      this.onPeerStateChange(socketId, {
        videoOn: peer.videoOn,
        audioOn: peer.audioOn,
      });
    };
    this.connections[socketId] = {
      peer,
      data,
    };
  };

  openLocalMedia = async (data) => {
    const { type, deviceId } = data;
    try {
      const localStream = await this.getUserMedia({
        type,
        deviceId,
      });
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
    } catch (e) {
      console.error('Error opening local media', e);
    }
  };
  closeLocalMedia = async (type) => {
    try {
      if (type === 'video') {
        if (!this.localVideoStream) {
          return;
        }
        this.localVideoStream.getTracks().forEach((track) => track.stop());
        this.localVideoStream = undefined;
        this.sendToAllChannels({
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
        this.sendToAllChannels({
          type: 'action-media',
          data: {
            type: 'audio',
            active: false,
          },
        });
      }
    } catch (err) {
      console.error(err);
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

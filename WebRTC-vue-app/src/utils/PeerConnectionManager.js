import Peer from './Peer';
export default class PeerConnectionManager {
  constructor(wsConnection, clientData) {
    this.connections = {};
    this.wsConn = wsConnection;
    this.localVideoStream = null;
    this.localAudioStream = null;
    this.dc = null;
    this.clientData = clientData;

    // khởi tạo một kết nối p2p khi một user kết nối vào room
    this.wsConn.on('Connected', async (message, data) => {
      console.log('Connected', `${data.UserName} joined`);

      const senderSocketId = message.SourceId;
      // await this._initPeers(senderSocketId);
      // gửi offer cho user mới kết nối vào room

      const peer = this._initPeer({
        socketId: senderSocketId,
        isSender: true,
        clientData,
      });
      this.onConnection({ id: senderSocketId, data });
      this.connections[senderSocketId] = { peer, clientData: data };
      this.onNewClientConnected();
    });

    this.wsConn.on('Negotiate', async (message, data) => {
      const senderSocketId = message.SourceId;
      const { clientData: remoteClientData } = data;
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
      this.connections[senderSocketId].peer.gotMessage(data);
    });

    // this.wsConn.on('Joined', async (message, data) => {
    //   const socketDatas = data;

    //   this.MySocketId = message.SourceId;

    //   socketDatas.forEach(async (data) => {
    //     const { SocketId } = data;
    //     if (this.connections[SocketId]) {
    //       return;
    //     }
    //     this._initPeer({
    //       socketId: SocketId,
    //       data,
    //       polite: false,
    //       newChannel: false,
    //     });
    //   });
    // });

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

  onStreamChange() {}
  onConnection = () => {};
  onPeerStateChange = () => {};
  onPeerDestroyed = () => {};
  onNewClientConnected = () => {};

  sendToAllChannels = (message) => {
    Object.values(this.connections).forEach(({ peer }) => {
      peer.sendMessageChannel(message);
    });
  };

  _initPeer = ({ socketId, isSender, clientData }) => {
    const peer = new Peer(this.wsConn, {
      destId: socketId,
      isSender,
      clientData,
    });
    if (this.localAudioStream) {
      peer.startStream(this.localAudioStream);
    }
    if (this.localVideoStream) {
      peer.startStream(this.localVideoStream);
    }
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
    return peer;
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

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using WebSocketUtils.interfaces;
using WebSocketUtils.Models;

namespace WebSocketUtils
{
    public abstract class WSHandler : IWSHandler
    {
        private List<SocketGroup> _group = new List<SocketGroup>();
     
        private IWSManager _wsConnectionManager { get; set; }

        public WSHandler(IWSManager connectionManager)
        {
            _wsConnectionManager = connectionManager;
        }

        /// <summary>
        /// Thực hiện khi socket vừa kết nối 
        /// </summary>
        /// <param name="socket"></param>
        /// <returns></returns>
        public virtual async Task OnConnected(WebSocket socket)
        {
            _wsConnectionManager.AddSocket(socket);
        }
        /// <summary>
        /// Thực hiện khi socket ngắt kết nối
        /// </summary>
        /// <param name="socket"></param>
        /// <returns></returns>
        public virtual async Task OnDisconnected(WebSocket socket)
        {
            await _wsConnectionManager.RemoveSocket(_wsConnectionManager.GetId(socket));
        }

       
        /// <summary>
        /// Gửi tin nhắn dạng string cho socket khác
        /// </summary>
        /// <param name="socket"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task SendMessageAsync(WebSocket socket, string message)
        {
            if (socket.State != WebSocketState.Open)
                return;

            await socket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(message),
                                                                  offset: 0,
                                                                  count: message.Length),
                                   messageType: WebSocketMessageType.Text,
                                   endOfMessage: true,
                                   cancellationToken: CancellationToken.None);
        }

        /// <summary>
        /// Gửi message cho socket khác theo id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task SendMessageAsync(string id, string message)
        {
            await SendMessageAsync(_wsConnectionManager.GetSocketById(id), message);
        }

        public abstract Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer);

        /// <summary>
        /// Gửi message đến từng nhóm socket
        /// </summary>
        /// <param name="socket"></param>
        /// <param name="groupName"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        public async Task SendMessageAsyncGroup(WebSocket socket, string groupName, string message)
        {
            var group = _group.FirstOrDefault(x => x.GroupName == groupName);
            var senderSocketId = _wsConnectionManager.GetId(socket);
            if (group != null)
            {
                foreach (var connectionId in group.ConnectionIds)
                {
                    if (connectionId != senderSocketId)
                    {
                        await SendMessageAsync(connectionId, message);
                    }
                }
            }
        }

        /// <summary>
        /// Tìm groupsocket theo group name
        /// </summary>
        /// <param name="groupName"></param>
        /// <returns></returns>
        public SocketGroup? GetGroup(string groupName)
        {
            return  _group.FirstOrDefault(p => p.GroupName == groupName);
        }
        public SocketGroup? GetGroup(WebSocket socket)
        {
            var socketId = _wsConnectionManager.GetId(socket);
            return _group.FirstOrDefault(p => p.ConnectionIds.Contains(socketId));
        }
        /// <summary>
        /// Thêm socket vào group 
        /// </summary>
        /// <param name="socket"></param>
        /// <param name="groupName"></param>
        /// <returns></returns>
        public Boolean JoinGroup(WebSocket socket, string groupName, string? secret)
        {
            if (String.IsNullOrEmpty(groupName))
            {
                return false;
            }
            var group = GetGroup(groupName);
            
            if (group == null)
            {
                group = new SocketGroup(groupName);
                if (!String.IsNullOrEmpty(secret))
                {
                    group.GroupSecret = secret;
                }
                _group.Add(group);
            } else if(secret != group.GroupSecret)
            {
                return false;
            }
           
            var socketId = _wsConnectionManager.GetId(socket);
            group.AddConnection(socketId);
            return true;
        }

        /// <summary>
        /// Xoá socket ra khỏi group
        /// </summary>
        /// <param name="socket"></param>
        /// <returns></returns>
        public Boolean LeaveGroup(WebSocket socket)
        {
            var socketId = _wsConnectionManager.GetId(socket);
            var group = _group.FirstOrDefault(p => p.ConnectionIds.Contains(socketId));
            if (group != null)
            {
                group.RemoveConnection(socketId);

                if (group.ConnectionIds.Count == 0)
                {
                    _group.Remove(group);
                }
            }
            
            return true;
        }
    }
}

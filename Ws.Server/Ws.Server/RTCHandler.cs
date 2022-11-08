using System.Net.WebSockets;
using System.Text;
using WebSocketUtils;
using WebSocketUtils.interfaces;
using WS.Server.Models;
using WS.Server.Enums;
using Newtonsoft.Json;
using WebSocketUtils.Models;

namespace WS.Server
{
    /// <summary>
    /// Xử lý các sự kiện của socket theo mức cụ thể từ base WSHandler
    /// 
    /// Author: mtuan - 15/10/2022
    /// </summary>
    public class RTCHandler : WSHandler, IWSHandler
    {
        IWSManager _webSocketManager;

        public RTCHandler(IWSManager webSocketManager) : base(webSocketManager)
        {
            _webSocketManager = webSocketManager;
        }
        public override async Task HandleMessage(WebSocket socket, string message)
        {

            Console.WriteLine(message);
            var socketId = _webSocketManager.GetId(socket);

            var wsMessage = JsonConvert.DeserializeObject<WSMessage>(message);
            switch (wsMessage.ActionType)
            {
                case MessageEnum.ActionType.JoinGroup:
                    if (String.IsNullOrEmpty(wsMessage.GroupName))
                    {
                        return;
                    }
                    var res = JoinGroup(socket, wsMessage.GroupName, wsMessage.GroupSecret);
                    if (!res) break;

                    /*var announceClient = new WSMessage
                    {
                        // send back to client to signal joined successfully
                        ActionType = MessageEnum.ActionType.Joined,
                        SourceId = socketId,
                    };
                    _ = SendMessageAsync(socket, JsonConvert.SerializeObject(announceClient));*/

                    // send announce to other clients
                    var announceGroup = new WSMessage
                    {
                        ActionType = MessageEnum.ActionType.Connected,
                        SourceId = socketId,
                        Data = wsMessage.Data
                    };
            
                    Console.WriteLine($"{socketId} joined room {wsMessage.GroupName}");
                    _ = SendMessageAsyncGroup(socket, wsMessage.GroupName, JsonConvert.SerializeObject(announceGroup));

                    return;
                case MessageEnum.ActionType.LeaveGroup:
                    LeaveGroup(socket);
                    return;
                case MessageEnum.ActionType.Negotiate:
                    wsMessage.SourceId = socketId;
                    _ = SendMessageAsync(wsMessage.DestId, JsonConvert.SerializeObject(wsMessage));
                    return;
                case MessageEnum.ActionType.ChatMessage:
                    var group = GetGroup(socket);
                    wsMessage.SourceId = socketId;
                    Console.WriteLine(wsMessage.Data);
                    _ = SendMessageAsyncGroup(socket, group.GroupName, JsonConvert.SerializeObject(wsMessage));
                    return;
                default:
                    break;
            }
        }
        public override async Task OnConnected(WebSocket socket)
        {
            await base.OnConnected(socket);
            var socketId = _webSocketManager.GetId(socket);
            Console.WriteLine($"{socketId} connected");
            await SendMessageAsync(socket, JsonConvert.SerializeObject(new WSMessage() { ActionType = MessageEnum.ActionType.Announce, Announce = $"Welcome {socketId}" }));
        }
        public override async Task OnDisconnected(WebSocket socket)
        {
            try
            {
                var group = GetGroup(socket);
                var socketId = _webSocketManager.GetId(socket);
                if (group != null)
                {
                    await SendMessageAsyncGroup(socket, group.GroupName, JsonConvert.SerializeObject(new WSMessage
                    {
                        ActionType = MessageEnum.ActionType.Disconnected,
                        SourceId = socketId
                    }));
                    LeaveGroup(socket);
                }
                Console.WriteLine($"{socketId} disconnected");
                await _webSocketManager.RemoveSocket(socketId);
            } catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            
        }
    }
}

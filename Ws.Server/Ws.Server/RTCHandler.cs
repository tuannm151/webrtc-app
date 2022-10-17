using System.Net.WebSockets;
using System.Text;
using WebSocketUtils;
using WebSocketUtils.interfaces;
using System.Text.Json;
using WS.Server.Models;
using WS.Server.Enums;

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
        public override async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var socketId = _webSocketManager.GetId(socket);
            var message = $"{socketId} said: {Encoding.UTF8.GetString(buffer, 0, result.Count)}";
            Console.WriteLine(message);

            var wsMessage = JsonSerializer.Deserialize<WSMessage>(Encoding.UTF8.GetString(buffer, 0, result.Count));
            
            switch (wsMessage.ActionType)
            {
                
                case MessageEnum.ActionType.JoinGroup:
                    var res =  JoinGroup(socket, wsMessage.GroupName, wsMessage.GroupSecret);
                    if (!res) break;
                    var announce = new WSMessage();
                    announce.ActionType = MessageEnum.ActionType.Connected;
                    announce.SourceId = socketId;
                    announce.UserData = wsMessage.UserData;
                    await SendMessageAsyncGroup(socket, wsMessage.GroupName, JsonSerializer.Serialize(announce));
                    return;
                case MessageEnum.ActionType.LeaveGroup:
                    LeaveGroup(socket);
                    return;
                case MessageEnum.ActionType.Offer:
                    wsMessage.SourceId = socketId;
                    _ = SendMessageAsync(wsMessage.DestId, JsonSerializer.Serialize(wsMessage));
                    return;
                case MessageEnum.ActionType.Answer:
                    _ = SendMessageAsync(wsMessage.DestId, JsonSerializer.Serialize(wsMessage));
                    return;    
                default:
                    break;
            }
           await base.OnDisconnected(socket);


        }
        public override async Task OnConnected(WebSocket socket)
        {
            await base.OnConnected(socket);
            var socketId = _webSocketManager.GetId(socket);
            Console.WriteLine($"{socketId} connected");
            await SendMessageAsync(socket, $"Hello {socketId}");
        }
        public override async Task OnDisconnected(WebSocket socket)
        {
            var group = GetGroup(socket);
            if(group != null)
            {
                await SendMessageAsyncGroup(socket, group.GroupName, JsonSerializer.Serialize(new WSMessage
                {
                    ActionType = MessageEnum.ActionType.Disconnected,
                    SourceId = _webSocketManager.GetId(socket)
                }));
                LeaveGroup(socket);
            }
            await base.OnDisconnected(socket);
        }
    }
}

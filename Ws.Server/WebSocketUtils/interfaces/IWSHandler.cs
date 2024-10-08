﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using WebSocketUtils.Models;

namespace WebSocketUtils.interfaces
{
    public interface IWSHandler
    {
        Task OnConnected(WebSocket socket);
        Task OnDisconnected(WebSocket socket);

        Boolean JoinGroup(WebSocket socket, string groupName, string? secret);
        Boolean LeaveGroup(WebSocket socket);
        Task SendMessageAsync(WebSocket socket, string message);
        Task SendMessageAsyncGroup(WebSocket socket,string groupName, string message);
        Task SendMessageAsync(string id, string message);
        Task HandleMessage(WebSocket socket, string message);
        List<string> GetGroupSocketIds(string groupName);
    }
}

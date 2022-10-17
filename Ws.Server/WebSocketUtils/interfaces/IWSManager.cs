using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using WebSocketUtils.Models;

namespace WebSocketUtils.interfaces
{
    public interface IWSManager
    {   
            
        WebSocket GetSocketById(string id);
        string GetId(WebSocket socket);
        void AddSocket(WebSocket socket);
        Task RemoveSocket(string id);
    }
}

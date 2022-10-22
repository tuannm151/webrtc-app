using System.Collections.Concurrent;
using System.Net.WebSockets;
using WebSocketUtils.interfaces;


namespace WebSocketUtils
{
    public class WSManager : IWSManager
    {
        /// <summary>
        /// Dùng concurrentcy directionary để đảm bảo thread-safe khi có nhiều luồng truy cập
        /// </summary>
        private ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();
        
        public WebSocket GetSocketById(string id)
        {
            return _sockets.FirstOrDefault(p => p.Key == id).Value;
        }

        public string GetId(WebSocket socket)
        {
            return _sockets.FirstOrDefault(p => p.Value == socket).Key;
        }
        
        public void AddSocket(WebSocket socket)
        {
            _sockets.TryAdd(CreateConnectionId(), socket);
        }

        public async Task RemoveSocket(string id)
        {
            if (id == null) return;
             _sockets.TryRemove(id, out WebSocket socket);

            if (socket.State != WebSocketState.Open) return;

            await socket.CloseAsync(closeStatus: WebSocketCloseStatus.NormalClosure,
                                    statusDescription: "Closed by the WebSocketManager",
                                    cancellationToken: System.Threading.CancellationToken.None);
        }

        /// <summary>
        /// Tạo ID GUID cho socket
        /// </summary>
        /// <returns></returns>
        private string CreateConnectionId()
        {
            return System.Guid.NewGuid().ToString();
        }
        
    }
}
using Microsoft.AspNetCore.Mvc;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using WebSocketUtils;
using WebSocketUtils.interfaces;

namespace Ws.Server.Controller
{
    public class WebSocketController : ControllerBase
    {
        private IWSHandler _webSocketHandler { get; set; }

        public WebSocketController(IWSHandler webSocketHandler)
        {
            _webSocketHandler = webSocketHandler;
        }

        [HttpGet("/ws")]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await _webSocketHandler.OnConnected(webSocket);
                await Receive(webSocket, async (result, message) =>
                {
                   
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        await _webSocketHandler.HandleMessage(webSocket, message);
                        return;
                    }

                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await _webSocketHandler.OnDisconnected(webSocket);
                        return;
                    }

                });
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private async Task Receive(WebSocket socket, Action<WebSocketReceiveResult, string> handleMessage)
        {
            try
            {
                var buffer = new byte[1024 * 4];
                while (socket.State == WebSocketState.Open)
                {
                    WebSocketReceiveResult result;
                    var messageStr = new StringBuilder();
                    do
                    {
                        result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                        if (result.MessageType == WebSocketMessageType.Close)
                            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty,
                                CancellationToken.None);
                        else
                            messageStr.Append(Encoding.UTF8.GetString(buffer, 0, result.Count));
                    } while (!result.EndOfMessage);

                    handleMessage(result, messageStr.ToString());
                }
            } catch (Exception e)
            {
                await _webSocketHandler.OnDisconnected(socket);
               
            }
        }
    }
}
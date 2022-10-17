using WebSocketUtils;
using WebSocketUtils.interfaces;
using WS.Server;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddScoped<IWSManager, WSManager>();
builder.Services.AddScoped<IWSHandler, RTCHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");


var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};

app.UseWebSockets(webSocketOptions);
app.MapControllers();
app.Run();



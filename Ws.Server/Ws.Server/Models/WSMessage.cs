using WS.Server.Enums;
using static WS.Server.Enums.MessageEnum;

namespace WS.Server.Models
{
    public class WSMessage
    {
        
        /// <summary>
        /// Dữ liệu dạng string cần gửi
        /// </summary>
        public SendType? SendType { get; set; }
        public ActionType ActionType { get; set; }
    
        /// <summary>
        /// Id của socket gửi
        /// </summary>
        public string? SourceId { get; set; }

        /// <summary>
        /// Id của socket nhận
        /// </summary>
        public string? DestId { get; set; }

        public string? GroupName { get; set; }
        public string? GroupSecret { get; set; }

        public UserData UserData { get; set; }

        public WSMessage()
        {
            UserData = new UserData();
        }
    }
}

using Newtonsoft.Json.Converters;
using Newtonsoft.Json;
using static WS.Server.Enums.MessageEnum;

namespace WS.Server.Models
{
    public class WSMessage
    {

        /// <summary>
        /// Dữ liệu dạng string cần gửi
        /// </summary>
        [JsonProperty("ActionType")]
        [JsonConverter(typeof(StringEnumConverter))]
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

        public string? Announce { get; set; }

        public string? Data { get; set; }

        public WSMessage()
        {
        }
    }
}

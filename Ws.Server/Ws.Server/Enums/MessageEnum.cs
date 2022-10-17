namespace WS.Server.Enums
{
    public class MessageEnum
    {
        public enum SendType
        {
            /// <summary>
            /// Gửi đến tất cả các socket
            /// </summary>
            All,
            /// <summary>
            /// Gửi đến một socket
            /// </summary>
            One,
            /// <summary>
            /// Gửi đến một nhóm socket
            /// </summary>
            Group
        }
        
        /// <summary>
        /// Các dạng request SDP
        /// Offer - client A gửi sdp cho client B
        /// Answer - client B gửi sdp cho client A sau khi nhận được offer
        /// </summary>
        public enum ActionType
        {
            Offer,
            Answer,
            JoinGroup,
            LeaveGroup,
            Connected,
            Disconnected
        }

    }
    
}

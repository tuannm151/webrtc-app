using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSocketUtils.Models
{
    /// <summary>
    /// Model group socket
    /// Hỗ trợ việc quản lý nhóm các socket
    /// </summary>
    public class SocketGroup
    {
        public string GroupName { get; set; }
        public string? GroupSecret { get; set; }
        /// <summary>
        /// Một list các string bao gồm các socket id
        /// 
        /// </summary>
        public List<string> ConnectionIds { get; set; }

        public SocketGroup(string groupName)
        {
            GroupName = groupName;
            ConnectionIds = new List<string>();
        }
        /// <summary>
        /// Thêm socket mới vào group
        /// </summary>
        /// <param name="connectionId"></param>
        public void AddConnection(string connectionId)
        {
            ConnectionIds.Add(connectionId);
        }
        /// <summary>
        /// Xoá socket ra khỏi group
        /// </summary>
        /// <param name="connectionId"></param>
        public void RemoveConnection(string connectionId)
        {
            ConnectionIds.Remove(connectionId);
        }
    }
}

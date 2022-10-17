namespace WS.Server.Models
{
    public class UserData
    {
        public string UserName { get; set; }

        public string? Data { get; set; }

        public UserData()
        {
            UserName = "No Name";
        }
    }
}

using API.Models;

namespace API.Extensions;

public static class MiscExtensions
{
    public static ServerModel GetServer(this UserModel user, Guid serverId)
        => user.Servers.FirstOrDefault(x => x.ServerId == serverId)
            ?? throw new Exception($"Server does not exist. ({serverId})");
}

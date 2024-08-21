using API.Models;
using LiteDB;

namespace API.Extensions;

public static class DatabaseExtensions
{
    public static ServerModel FindServerLocally(this ILiteDatabase database, int userId, Guid serverId)
    {
        var user = database.GetUser(userId);

        return user.Servers.FirstOrDefault(x => x.ServerId == serverId)
            ?? throw new Exception($"Server does not exist. ({serverId})");
    }

    public static UserModel GetUser(this ILiteDatabase database, int userId)
    {
        return database.GetCollection<UserModel>().FindById(userId)
            ?? throw new Exception("User does not exist.");
    }
}

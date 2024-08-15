using LiteDB;
using OutlineManager.Models;

namespace OutlineManager.Services;

public interface IServerService
{
    Task Add(ServerModel server);
    Task<IEnumerable<ServerModel>> GetAll();
    Task<ServerModel?> Get(int id);
}

public class ServerService(
    ILiteDatabase _database
    ) : IServerService
{
    public Task Add(ServerModel server)
    {
        var servers = _database.GetCollection<ServerModel>();

        servers.Insert(server);

        return Task.CompletedTask;
    }

    public Task<IEnumerable<ServerModel>> GetAll() 
        => Task.FromResult(_database.GetCollection<ServerModel>().FindAll());

    public Task<ServerModel?> Get(int id) 
        => Task.FromResult(_database.GetCollection<ServerModel>().Find(x => x.Id == id).FirstOrDefault());
}

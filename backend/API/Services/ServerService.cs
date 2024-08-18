using API.Dtos.Server;
using API.Models;
using LiteDB;

namespace API.Services;

public interface IServerService
{
    Task<ServerInfo> Add(int userId, NewServerDto newServer);
    Task<ServerInfo> Get(int userId, Guid serverId);
    Task<IEnumerable<AccessKeyResponse>> GetAccessKeys(int userId, Guid serverId);
}

public class ServerService(
    ILiteDatabase _database,
    ILogger<ServerService> _logger,
    IHttpClientFactory _httpClientFactory
    ) : IServerService
{
    private ILiteCollection<UserModel> Users => _database.GetCollection<UserModel>();

    public async Task<ServerInfo> Add(int userId, NewServerDto newServer)
    {
        _logger.LogInformation("Adding a new server for {userId} ({server}).", userId, newServer.ApiUrl);

        var user = Users.FindById(userId);

        if (user == null)
        {
            _logger.LogError("User does not exist. ({userId})", userId);
            throw new Exception("User does not exist.");
        }

        var server = new ServerModel(newServer.ApiUrl);

        var response = await GetServerInfo(server);

        _logger.LogInformation("Server is valid and reachable. {IdFromServer}", response!.ServerId);

        server.Name = response.Name;
        server.ServerId = response.ServerId;

        user.Servers.Add(server);
        Users.Update(user);

        return response!;
    }

    public Task<ServerInfo> Get(int userId, Guid serverId)
    {
        var server = FindServerLocally(userId, serverId);

        return GetServerInfo(server)!;
    }

    public async Task<IEnumerable<AccessKeyResponse>> GetAccessKeys(int userId, Guid serverId)
    {
        var server = FindServerLocally(userId, serverId);

        var client = _httpClientFactory.Create(server.ApiUrl);

        var accessKeyCollection = await client.GetFromJsonAsync<AccessKeyCollectionResponse>($"{server.ApiPrefix}/access-keys")
            ?? throw new Exception("The collection is empty");

        var useage = await client.GetFromJsonAsync<UsageResponse>($"{server.ApiPrefix}/metrics/transfer");

        foreach (var key in accessKeyCollection.AccessKeys)
            if (useage?.BytesTransferredByUserId.TryGetValue(key.Id, out var value) == true)
                key.DataLimit.Consumed = value;

        return accessKeyCollection.AccessKeys;
    }

    private ServerModel FindServerLocally(int userId, Guid serverId)
    {
        var user = Users.FindById(userId);

        if (user == null)
        {
            _logger.LogError("User does not exist. ({userId})", userId);
            throw new Exception("User does not exist.");
        }

        var server = user.Servers.FirstOrDefault(x => x.ServerId == serverId);

        if (server == null)
        {
            _logger.LogError("Server does not exist. ({serverId})", serverId);
            throw new Exception("Server does not exist.");
        }

        return server;
    }

    private async Task<ServerInfo?> GetServerInfo(ServerModel server)
    {
        var client = _httpClientFactory.Create(server.ApiUrl);

        var response = await client.GetFromJsonAsync<ServerInfo>(server.ApiPrefix + "/server");
        return response;
    }
}

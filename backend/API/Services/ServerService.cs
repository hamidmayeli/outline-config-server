using API.Dtos.Server;
using LiteDB;

namespace API.Services;

public interface IServerService
{
    Task Add(int userId, NewServerDto newServer);
}

public class ServerService(
    ILiteDatabase _database,
    ILogger<ServerService> _logger,
    IHttpClientFactory _httpClientFactory
    ) : IServerService
{
    public async Task Add(int userId, NewServerDto newServer)
    {
        _logger.LogInformation("Adding a new server for {userId} ({server}).", userId, newServer.ApiUrl);

        var client = _httpClientFactory.Create(newServer.ApiUrl);

        var response = await client.GetAsync("/server");


    }
}

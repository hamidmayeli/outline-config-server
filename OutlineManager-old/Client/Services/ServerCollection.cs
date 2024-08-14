using Client.Models;

namespace Client.Services;

public interface IServerCollection
{
    Task Add(Server server);
    Task<IEnumerable<Server>> GetAll();
    Task<Server?> Get(int id);
}

public class ServerCollection(
    ILocalStorage _localStorage,
    IHttpClientFactory _httpClientFactory
    ): IServerCollection
{
    private const string ServerListKey = "servers";

    private List<Server>? _servers;

    public async Task<IEnumerable<Server>> GetAll()
        => _servers ??= await _localStorage.Get<List<Server>>(ServerListKey) ?? [];

    public async Task Add(Server server)
    {
        var all = await GetAll();

        if (all.Any(x => x.Equals(server)))
            throw new Exception("Duplicated server entry.");

        server.Id = _servers!.Count + 1;

        _servers.Add(server);

        await _localStorage.Set(ServerListKey, _servers);
    }

    public async Task<Server?> Get(int id)
    {
        var result = (await GetAll()).FirstOrDefault(x => x.Id == id);

        result?.SetHttpClient(_httpClientFactory.Create(result.ApiUrl));

        return result;
    }
}

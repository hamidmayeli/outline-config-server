using API.Models;
using LiteDB;

namespace API.Services;

public interface ILocalKeyService
{
    Task<string?> GetAccessKey(Guid id);
    Task<IEnumerable<LocalKey>> GetAll();
    Task Upsert(LocalKey key);
    Task Delete(Guid keyId);
    Task UpdateDomain();
}

public class LocalKeyService(
    ILiteDatabase _database,
    ILogger<LocalKeyService> _logger,
    IHttpContextAccessor _httpContextAccessor,
    IConfiguration _configuration,
    ICFConfigResolver _cfConfigResolver
    ) : ILocalKeyService
{
    private ILiteCollection<LocalKey> Keys => _database.GetCollection<LocalKey>();

    public Task<IEnumerable<LocalKey>> GetAll() => Task.FromResult(Keys.FindAll());

    public async Task Upsert(LocalKey key)
    {
        var request = _httpContextAccessor.HttpContext?.Request
            ?? throw new InvalidOperationException();

        SetConfigUrl(key, request);

        try
        {
            await _cfConfigResolver.SetConfig(key.Id, key.AccessKey);

            var endpoint = _cfConfigResolver.CreateGetEndpoint(
                _configuration.GetValue<string>("CFConfig:Url"),
                key.Id
                ).Replace("https", "ssconf");

            key.CfUrl = $"{endpoint}#cf-{key.Name}";

            _logger.LogInformation("Cloudflare key upserted {key}", key.Id);
        }
        catch (Exception exception)
        {
            _logger.LogCritical(exception, "Failed to upsert local key {key}", key);
        }

        Keys.Upsert(key);

        _logger.LogInformation("Local key upserted {key}", key);
    }

    public Task<string?> GetAccessKey(Guid id)
        => Task.FromResult(Keys.FindById(id)?.AccessKey);

    public Task Delete(Guid keyId)
    {
        Keys.DeleteMany(x => x.Id == keyId);
        _logger.LogInformation("Local key deleted {key}", keyId);

        return Task.CompletedTask;
    }

    public Task UpdateDomain()
    {
        var request = _httpContextAccessor.HttpContext?.Request
            ?? throw new InvalidOperationException();

        var keys = Keys.FindAll().ToList();

        foreach (var key in keys)
            SetConfigUrl(key, request);

        Keys.Update(keys);

        _logger.LogInformation("Local keys updated");

        return Task.CompletedTask;
    }

    private static void SetConfigUrl(LocalKey key, HttpRequest request)
        => key.ConfigUrl = $"ssconf://{request.Host}/api/v1/config/{key.Id}#{key.Name}";
}

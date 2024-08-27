using API.Models;
using LiteDB;
using Microsoft.AspNetCore.DataProtection.KeyManagement;

namespace API.Services;

public interface ILocalKeyService
{
    Task<string?> GetAccessKey(Guid id);
    Task<IEnumerable<LocalKey>> GetAll();
    Task Upsert(LocalKey key);
    Task Delete(Guid keyId);
}

public class LocalKeyService(
    ILiteDatabase _database,
    ILogger<LocalKeyService> _logger,
    IHttpContextAccessor _httpContextAccessor
    ) : ILocalKeyService
{
    private ILiteCollection<LocalKey> Keys => _database.GetCollection<LocalKey>();

    public Task<IEnumerable<LocalKey>> GetAll() => Task.FromResult(Keys.FindAll());

    public Task Upsert(LocalKey key)
    {
        var request = _httpContextAccessor.HttpContext?.Request
            ?? throw new InvalidOperationException();

        key.ConfigUrl = $"ssconf://{request.Host}/api/v1/config/{key.Id}#{key.Name}";

        Keys.Upsert(key);

        _logger.LogInformation("Local key upserted {key}", key);

        return Task.CompletedTask;
    }

    public Task<string?> GetAccessKey(Guid id)
        => Task.FromResult(Keys.FindById(id)?.AccessKey);

    public Task Delete(Guid keyId)
    {
        Keys.DeleteMany(x => x.Id == keyId);
        _logger.LogInformation("Local key deleted {key}", keyId);

        return Task.CompletedTask;
    }
}

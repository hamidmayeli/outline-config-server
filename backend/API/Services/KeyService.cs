using API.Extensions;
using API.Models;
using LiteDB;

namespace API.Services;

public interface IKeyService
{
    Task<AccessKeyResponse> Create(int userId, Guid serverid, NewKeyRequest request);
}

public class KeyService(
    ILiteDatabase _database,
    IOutlineServerClientFactory _outlineServerClientFactory,
    ILogger<KeyService> _logger
    ) : IKeyService
{
    public async Task<AccessKeyResponse> Create(int userId, Guid serverid, NewKeyRequest request)
    {
        var server = _database.FindServerLocally(userId, serverid);
        var client = _outlineServerClientFactory.Create(server.ApiUrl);

        var result = await client.CreateKey(server.ApiPrefix, request);
        result.DataLimit.Bytes = request.Limit.Bytes;

        _logger.LogInformation("A new key is created ({id}).", result.Id);
        return result;
    }
}

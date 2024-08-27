﻿using API.Extensions;
using API.Models;
using LiteDB;

namespace API.Services;

public interface IKeyService
{
    Task<AccessKeyResponse> Create(int userId, Guid serverId, KeyRequest request);
    Task Delete(int userId, Guid serverId, string keyId);
    Task Update(int userId, Guid serverId, string keyId, KeyRequest request);
}

public class KeyService(
    ILiteDatabase _database,
    IOutlineServerClientFactory _outlineServerClientFactory,
    ILogger<KeyService> _logger
    ) : IKeyService
{
    public async Task<AccessKeyResponse> Create(int userId, Guid serverId, KeyRequest request)
    {
        var server = _database.FindServerLocally(userId, serverId);
        var client = _outlineServerClientFactory.Create(server.ApiUrl);

        if (request.Limit?.Bytes < 1000_000_000)
        {
            request.Limit = null;
        }

        var result = await client.CreateKey(server.ApiPrefix, request);
        result.DataLimit.Bytes = request.Limit?.Bytes;

        _logger.LogInformation("A new key is created ({id}).", result.Id);
        return result;
    }

    public async Task Delete(int userId, Guid serverId, string keyId)
    {
        var server = _database.FindServerLocally(userId, serverId);

        var client = _outlineServerClientFactory.Create(server.ApiUrl);

        await client.DeleteAccessKey(server.ApiPrefix, keyId);
    }

    public async Task Update(int userId, Guid serverId, string keyId, KeyRequest request)
    {
        var server = _database.FindServerLocally(userId, serverId);

        var client = _outlineServerClientFactory.Create(server.ApiUrl);

        if (request.Limit != null)
            await client.SetLimit(server.ApiPrefix, keyId, new() { Limit = request.Limit });
        else
            await client.RemoveLimit(server.ApiPrefix, keyId);

        await client.SetName(server.ApiPrefix, keyId, new() { Name = request.Name });
    }
}

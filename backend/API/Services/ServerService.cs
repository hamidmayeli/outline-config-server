﻿using API.Dtos.Server;
using API.Extensions;
using API.Models;
using LiteDB;

namespace API.Services;

public interface IServerService
{
    Task<ServerInfo> Add(int userId, NewServerDto newServer);
    Task Delete(int userId, Guid id);
    Task<ServerInfo> Get(int userId, Guid serverId);
    Task<IEnumerable<AccessKeyResponse>> GetAccessKeys(int userId, Guid serverId);
    Task<IEnumerable<ServerDto>> GetAll(int userId);
}

public class ServerService(
    ILiteDatabase _database,
    ILogger<ServerService> _logger,
    IOutlineServerClientFactory _outlineClientFactory
    ) : IServerService
{
    private ILiteCollection<UserModel> Users => _database.GetCollection<UserModel>();
    private ILiteCollection<LocalKey> LocalKeys => _database.GetCollection<LocalKey>();

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

    public Task Delete(int userId, Guid id)
    {
        var user = _database.GetUser(userId);

        var server = user.Servers.FirstOrDefault(x => x.ServerId == id);

        if( server != null)
        {
            user.Servers.Remove(server);
            Users.Update(user);
        }

        return Task.CompletedTask;
    }

    public Task<ServerInfo> Get(int userId, Guid serverId)
    {
        var server = _database.FindServerLocally(userId, serverId);

        return GetServerInfo(server)!;
    }

    public async Task<IEnumerable<AccessKeyResponse>> GetAccessKeys(int userId, Guid serverId)
    {
        var server = _database.FindServerLocally(userId, serverId);

        var accessKeyCollection = await LoadRemoteKeys(server);

        static string removeHash(string input)
        {
            int hashIndex = input.IndexOf('#');
            return hashIndex >= 0 ? input[..hashIndex] : input;
        }

        var localConfigs = LocalKeys.FindAll().ToDictionary(x => removeHash(x.AccessKey), x => x.ConfigUrl);

        foreach (var item in accessKeyCollection.AccessKeys)
        {
            if (localConfigs.TryGetValue(item.AccessUrl, out var configUrl))
                item.ConfigUrl = configUrl;
        }

        return accessKeyCollection.AccessKeys;
    }

    private async Task<AccessKeyCollectionResponse> LoadRemoteKeys(ServerModel server)
    {
        var client = _outlineClientFactory.Create(server.ApiUrl);

        var accessKeyCollection = await client.GetAccessKey(server.ApiPrefix);

        var useage = await client.GetUsage(server.ApiPrefix);

        foreach (var key in accessKeyCollection.AccessKeys)
            if (useage?.BytesTransferredByUserId.TryGetValue(key.Id, out var value) == true)
                key.DataLimit.Consumed = value;

        return accessKeyCollection;
    }

    public Task<IEnumerable<ServerDto>> GetAll(int userId)
        => Task.FromResult(_database.GetUser(userId).Servers.Select(x => new ServerDto(x.ServerId, x.Name)));

    private async Task<ServerInfo?> GetServerInfo(ServerModel server)
    {
        var client = _outlineClientFactory.Create(server.ApiUrl);

        var response = await client.GetServerInfo(server.ApiPrefix);

        return response;
    }
}

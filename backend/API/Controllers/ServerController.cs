using API.Dtos.Server;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ServerController(
    IServerService _serverService
    ) : ApiController
{
    [HttpPost]
    public async Task<Ok<ServerInfo>> Add(NewServerDto server)
    {
        var result = await _serverService.Add(UserId, server);

        return TypedResults.Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<Ok<ServerInfo>> Get(Guid id)
    {
        var result = await _serverService.Get(UserId, id);

        return TypedResults.Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<NoContent> Delete(Guid id)
    {
        await _serverService.Delete(UserId, id);

        return TypedResults.NoContent();
    }

    [HttpGet("{id}/keys")]
    public async Task<Ok<IEnumerable<AccessKeyResponse>>> GetKeys(Guid id)
    {
        var result = await _serverService.GetAccessKeys(UserId, id);

        return TypedResults.Ok(result);
    }

    [HttpGet]
    public async Task<Ok<IEnumerable<ServerDto>>> GetAll()
    {
        var result = await _serverService.GetAll(UserId);

        return TypedResults.Ok(result);
    }

    [HttpPut("{id}/name")]
    public async Task<NoContent> SetName(Guid id, SetNameRequest request)
    {
        await _serverService.UpdateName(UserId, id, request.Name);

        return TypedResults.NoContent();
    }
}

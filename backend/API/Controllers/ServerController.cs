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

    [HttpGet("{id}/keys")]
    public async Task<Ok<IEnumerable<AccessKeyResponse>>> GetKeys(Guid id)
    {
        var result = await _serverService.GetAccessKeys(UserId, id);

        return TypedResults.Ok(result);
    }
}

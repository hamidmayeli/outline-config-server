using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ConfigController(
    IServerService _serverService
    ) : ApiController
{
    [HttpGet("{serverId}/{keyId}")]
    [AllowAnonymous]
    public async Task<Ok<string?>> Translate(Guid serverId, Guid keyId)
    {
        var result = await _serverService.GetAccessKeyFromLocal(serverId, keyId);
        return TypedResults.Ok<string?>(result);
    }
}

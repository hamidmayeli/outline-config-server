using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class KeyController(
    ILogger<KeyController> _logger,
     IKeyService _keyService
    ) : ApiController
{
    [HttpPost("{serverId}")]
    public async Task<Ok<AccessKeyResponse>> Add(Guid serverId, KeyRequest request)
    {
        _logger.LogDebug("Creating access key from server {serverId}", serverId);

        var response = await _keyService.Create(UserId, serverId, request);

        return TypedResults.Ok(response);
    }

    [HttpDelete("{serverId}/{keyId}")]
    public async Task<NoContent> Delete(Guid serverId, string keyId)
    {
        _logger.LogDebug("Deleting access key {keyId} from server {serverId}", keyId, serverId);

        await _keyService.Delete(UserId, serverId, keyId);

        return TypedResults.NoContent();
    }

    [HttpPut("{serverId}/{keyId}")]
    public async Task<Results<NoContent, BadRequest>> Update(Guid serverId, string keyId, KeyRequest request)
    {
        _logger.LogDebug("Updating access key {keyId} from server {serverId}", keyId, serverId);

        await _keyService.Update(UserId, serverId, keyId, request);

        return TypedResults.NoContent();
    }
}

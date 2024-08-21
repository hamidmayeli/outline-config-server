using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class KeyController(
     IKeyService _keyService
    ) : ApiController
{
    [HttpPost("{serverId}")]
    public async Task<Ok<AccessKeyResponse>> Add(Guid serverId, NewKeyRequest request)
    {
        var response = await _keyService.Create(UserId, serverId, request);

        return TypedResults.Ok(response);
    }
}

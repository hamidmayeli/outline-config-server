using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ConfigController(
    ILocalKeyService _localKeyService
    ) : ApiController
{
    [HttpGet("{keyId}")]
    [AllowAnonymous]
    [EnableCors("AllowAllPolicy")]
    public async Task<string?> Translate(Guid keyId)
    {
        var result = await _localKeyService.GetAccessKey(keyId);
        return result;
    }

    [HttpGet]
    public async Task<Ok<IEnumerable<LocalKey>>> GetAll()
    {
        var result = await _localKeyService.GetAll();
        return TypedResults.Ok(result);
    }

    [HttpPost]
    public async Task<NoContent> Upsert([FromBody] LocalKey key)
    {
        await _localKeyService.Upsert(key);
        return TypedResults.NoContent();
    }

    [HttpDelete("{keyId}")]
    public async Task<NoContent> Delete(Guid keyId)
    {
        await _localKeyService.Delete(keyId);
        return TypedResults.NoContent();
    }
}

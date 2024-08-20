﻿using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ConfigController(
    ILocalKeyService _localKeyService
    ) : ApiController
{
    [HttpGet("{keyId}")]
    [AllowAnonymous]
    public async Task<Ok<string?>> Translate(Guid keyId)
    {
        var result = await _localKeyService.GetAccessKey(keyId);
        return TypedResults.Ok<string?>(result);
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
}

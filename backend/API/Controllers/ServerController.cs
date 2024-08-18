using API.Dtos.Server;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ServerController(
    IServerService _serverService
    ) : ApiController
{
    [HttpPost]
    public async Task<NoContent> Add(NewServerDto server)
    {
        await _serverService.Add(UserId, server);

        return TypedResults.NoContent();
    }
}

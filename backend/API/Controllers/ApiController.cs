using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("0")]
[Authorize]
public class ApiController : ControllerBase
{
    [ExcludeFromCodeCoverage]
    protected int UserId => GetUserId();

    [ExcludeFromCodeCoverage]
    protected bool IsAuthenticated => User.Identity?.IsAuthenticated == true;

    private int GetUserId()
    {
        if (int.TryParse(
                User.Claims.FirstOrDefault(x => x.Type == ClaimsIdentity.DefaultNameClaimType)?.Value,
                out var result))
            return result;

        throw new InvalidOperationException();
    }
}

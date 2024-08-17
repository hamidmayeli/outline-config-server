using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace API.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("0")]
[Authorize]
public class ApiController : ControllerBase
{
    //[ExcludeFromCodeCoverage]
    //protected int UserId => User.GetUserId();

    [ExcludeFromCodeCoverage]
    protected bool IsAuthenticated => User.Identity?.IsAuthenticated == true;
}

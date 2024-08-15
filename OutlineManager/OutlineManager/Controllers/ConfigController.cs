using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace OutlineManager.Controllers;

[Route("[Controller]")]
[ApiController]
public class ConfigController : Controller
{
    [HttpGet("{key}")]
    public string Decode(string key)
        => Encoding.ASCII.GetString(Convert.FromBase64String(key));

    [HttpPost]
    public string Encode([FromBody] string key)
        => Convert.ToBase64String(Encoding.ASCII.GetBytes(key));
}

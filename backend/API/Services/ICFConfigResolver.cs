namespace API.Services;
using Refit;

public interface ICFConfigResolver
{
    [Put("/v1/config/{key}")]
    [Headers("Content-Type: text/plain")]
    Task SetConfig(Guid key, [Body] string value);

    string CreateGetEndpoint(string? domain, Guid key) => $"{domain}/v1/config/{key}";
}

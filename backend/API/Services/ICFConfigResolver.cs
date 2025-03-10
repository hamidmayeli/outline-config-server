namespace API.Services;
using Refit;

public interface ICFConfigResolver
{
    [Put("/v1/config/{key}")]
    [Headers("Content-Type: text/plain")]
    Task SetConfig(Guid key, [Body] string value);
}

using API.Models;
using Refit;

namespace API.Services;

public interface IOutlineServerClient
{
    [Get("/{apiPrefix}/server")]
    Task<ServerInfo> GetServerInfo(string apiPrefix);

    [Get("/{apiPrefix}/access-keys")]
    Task<AccessKeyCollectionResponse> GetAccessKey(string apiPrefix);

    [Get("/{apiPrefix}/metrics/transfer")]
    Task<UsageResponse> GetUsage(string apiPrefix);
}

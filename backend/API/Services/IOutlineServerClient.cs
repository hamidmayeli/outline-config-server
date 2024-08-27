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

    [Post("/{apiPrefix}/access-keys")]
    Task<AccessKeyResponse> CreateKey(string apiPrefix, KeyRequest request);

    [Delete("/{apiPrefix}/access-keys/{keyId}")]
    Task DeleteAccessKey(string apiPrefix, string keyId);

    [Put("/{apiPrefix}/access-keys/{keyId}/data-limit")]
    Task SetLimit(string apiPrefix, string keyId, SetKeyLimitRequest request);

    [Delete("/{apiPrefix}/access-keys/{keyId}/data-limit")]
    Task RemoveLimit(string apiPrefix, string keyId);

    [Put("/{apiPrefix}/access-keys/{keyId}/name")]
    Task SetName(string apiPrefix, string keyId, SetKeyNameRequest request);
}

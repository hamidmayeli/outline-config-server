using System.Net.Http.Json;

namespace Client.Models;

public class Server
{
    private HttpClient? _httpClient;
    private string? _apiPrefix;

    private HttpClient HttpClient => _httpClient ?? throw new InvalidOperationException();

    public int Id { get; set; }

    public string Name { get; set; } = "New Server";

    public required string ApiUrl { get; init; }

    public required string CertSha256 { get; init; }

    public override bool Equals(object? obj)
        => ApiUrl.Equals((obj as Server)?.ApiUrl, StringComparison.InvariantCultureIgnoreCase);

    public override int GetHashCode() => ApiUrl.GetHashCode();

    public void SetHttpClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<string[]> LoadKeys()
    {
        try
        {
            var accessKeyCollection = await HttpClient.GetFromJsonAsync<AccessKeyCollection>($"{GetApiPrefix()}/access-keys", JsonExtensions.Options)
                ?? throw new Exception("The collection is empty");

            var useage = await HttpClient.GetFromJsonAsync<UsageResponse>($"{GetApiPrefix()}/metrics/transfer", JsonExtensions.Options);

            foreach (var key in accessKeyCollection.AccessKeys)
                if(useage?.BytesTransferredByUserId.TryGetValue(key.Id, out var value) == true)
                    key.UsageInBytes = value;
        }
        catch (Exception exception)
        {
        }

        return [];
    }

    private string GetApiPrefix() => _apiPrefix ??= new Uri(ApiUrl).PathAndQuery;
}

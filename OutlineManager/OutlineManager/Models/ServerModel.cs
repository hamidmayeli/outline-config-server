namespace OutlineManager.Models;

public class ServerModel
{
    private string? _apiPrefix;

    public int Id { get; set; }

    public string Name { get; set; } = "New Server";

    public required string ApiUrl { get; init; }

    public required string CertSha256 { get; init; }

    public string GetApiPrefix() => _apiPrefix ??= new Uri(ApiUrl).PathAndQuery;
}

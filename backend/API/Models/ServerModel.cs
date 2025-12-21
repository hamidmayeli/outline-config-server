using LiteDB;

namespace API.Models;

public record ServerModel
{
    public required string ApiUrl { get; set; }

    public Guid ServerId { get; set; } = Guid.Empty;

    public string Name { get; set; } = "No name";

    public bool IsHost { get; set; } = false;

    public string ApiPrefix => new Uri(ApiUrl).PathAndQuery.Trim('/');
}

public record ServerLocalKeys
{
    [BsonId]
    public Guid ServerId { get; set; } = Guid.Empty;
    public List<LocalAccessKey> LocalAccessKeys { get; set; } = [];
}

public record LocalAccessKey(Guid LocalId, string RemoteId, string AccessUrl);

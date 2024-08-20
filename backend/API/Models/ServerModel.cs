using LiteDB;

namespace API.Models;

public record ServerModel(string ApiUrl)
{
    public Guid ServerId { get; set; } = Guid.Empty;

    public string Name { get; set; } = "No name";

    public string ApiPrefix => new Uri(ApiUrl).PathAndQuery.Trim('/');
}

public record ServerLocalKeys
{
    [BsonId]
    public Guid ServerId { get; set; } = Guid.Empty;
    public List<LocalAccessKey> LocalAccessKeys { get; set; } = [];
}

public record LocalAccessKey(Guid LocalId, string RemoteId, string AccessUrl);

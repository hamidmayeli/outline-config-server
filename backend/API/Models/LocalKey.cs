using LiteDB;

namespace API.Models;

public class LocalKey
{
    [BsonId]
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Name { get; set; }

    public required string AccessKey { get; set; }

    public required string ConfigUrl { get; set; }
}

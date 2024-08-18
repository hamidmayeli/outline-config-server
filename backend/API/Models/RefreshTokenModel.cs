using LiteDB;

namespace API.Models;

public sealed record RefreshTokenModel
{
    [BsonId]
    public required string Token { get; init; }
    public int UserId { get; init; }
    public DateTime Expiry { get; init; }
}

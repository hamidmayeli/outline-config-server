namespace API.Models;

public record KeyRequest
{
    public required string Name { get; init; }

    public DataLimit? Limit { get; set; }

    public string Method { get; } = "aes-192-gcm";
}

public record SetKeyLimitRequest
{
    public DataLimit? Limit { get; set; }
}

public record SetKeyNameRequest
{
    public required string Name { get; init; }
}

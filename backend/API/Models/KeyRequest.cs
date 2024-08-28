namespace API.Models;

public record KeyRequest
{
    public required string Name { get; init; }

    public DataLimit? Limit { get; set; }

    public string Method { get; } = "aes-192-gcm";
}

public record SetLimitRequest(DataLimit? Limit);

public record SetNameRequest(string Name);

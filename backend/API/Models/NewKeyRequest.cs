namespace API.Models;

public record NewKeyRequest
{
    public required string Name { get; init; }

    public DataLimit? Limit { get; set; }

    public string Method { get; } = "aes-192-gcm";
}

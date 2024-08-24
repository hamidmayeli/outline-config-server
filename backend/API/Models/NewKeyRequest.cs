namespace API.Models;

public record NewKeyRequest
{
    public string Name { get; init; }
    public DataLimit? Limit { get; set; }
}

namespace Client.Models;

public record AccessKey
    (
        string Id,
        string Name,
        string AccessUrl
    )
{
    public long UsageInBytes { get; set; }
}

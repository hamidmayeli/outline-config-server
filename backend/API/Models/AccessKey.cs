namespace API.Models;

public record AccessKeyResponse
{
    public string Id { get; }
    public string Name { get; }
    public string AccessUrl { get; }
    public DataLimit DataLimit { get; }

    public string LocalAccessUrl { get; set; } = string.Empty;

    public AccessKeyResponse
    (
        string id,
        string name,
        string accessUrl,
        DataLimit? dataLimit
    )
    {
        Id = id;
        Name = name;
        AccessUrl = accessUrl;
        DataLimit = dataLimit ?? new();
    }
}

public record DataLimit
{
    public long? Bytes { get; set; }
    public long Consumed { get; set; }
}

public record AccessKeyCollectionResponse(IEnumerable<AccessKeyResponse> AccessKeys);

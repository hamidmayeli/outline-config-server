namespace Client.Models;

public record AccessKey
{
    public string Id { get; }
    public string Name { get; }
    public string AccessUrl { get; }
    public DataLimit DataLimit { get; }

    public AccessKey
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

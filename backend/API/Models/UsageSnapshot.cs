namespace API.Models;

public record UsageSnapshot(
    DateTime TimeStamp,
    Dictionary<string, long> Usage,
    IEnumerable<UsageDetail>? Details
);

public record UsageDetail(string Server, string Key, long Usage);

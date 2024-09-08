namespace API.Models;

public record UsageSnapshot(
    DateTime TimeStamp,
    Dictionary<string, long> Usage
);

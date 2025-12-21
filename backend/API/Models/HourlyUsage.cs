namespace API.Models;

public record HourlyUsage(
    long Time,
    IEnumerable<HourlyUsageItem> Usage
);

public record HourlyUsageItem(
    string? Id,
    string Name,
    decimal Value
);

public record HourlyUsageRaw(
    long Time,
    IEnumerable<HourlyUsageRawItem> Usage
);

public record HourlyUsageRawItem(
    string? Id,
    string Value
);

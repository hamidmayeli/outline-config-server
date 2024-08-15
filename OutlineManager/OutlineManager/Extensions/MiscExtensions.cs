namespace OutlineManager.Extensions;

public static class MiscExtensions
{
    public static void RunInParallel(this Task _) { }

    public static string ToHumanReadableBytes(this long bytes)
    {
        return bytes switch
        {
            0 => "",
            < 1000 => $"{bytes}B",
            < 1000_000 => $"{bytes / 1000.0:N2}KB",
            < 1000_000_000 => $"{bytes / 1000_000.0:N2}MB",
            _ => $"{bytes / 1000_000_000.0:N2}GB",
        };
    }

    public static string ToGB(this long bytes) => $"{bytes / 1000_000_000.0}GB";
}

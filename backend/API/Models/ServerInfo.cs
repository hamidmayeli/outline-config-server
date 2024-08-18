namespace API.Models;

public class ServerInfo
{
    public required string Name { get; set; }
    public Guid ServerId { get; set; }
    public bool MetricsEnabled { get; set; }
    public long CreatedTimestampMs { get; set; }
    public required string Version { get; set; }
    public int PortForNewAccessKeys { get; set; }
    public required string HostnameForAccessKeys { get; set; }
}

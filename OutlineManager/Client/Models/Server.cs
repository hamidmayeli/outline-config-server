namespace Client.Models;

public class Server
{
    public int Id { get; set; }

    public string Name { get; set; } = "New Server";

    public required string ApiUrl { get; init; }

    public required string CertSha256 { get; init; }

    public override bool Equals(object? obj)
        => ApiUrl.Equals((obj as Server)?.ApiUrl, StringComparison.InvariantCultureIgnoreCase);

    public override int GetHashCode() => ApiUrl.GetHashCode();
}

namespace API.Models;

public record ServerModel(string ApiUrl)
{
    public Guid ServerId { get; set; } = Guid.Empty;

    public string Name { get; set; } = "No name";

    public string ApiPrefix => new Uri(ApiUrl).PathAndQuery.TrimEnd('/');
}

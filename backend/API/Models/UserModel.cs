namespace API.Models;

public class UserModel
{
    public required string Username { get; set; }

    public int Id { get; set; }

    public required byte[] Salt { get; set; }

    public required string Password { get; set; }

    public List<ServerModel> Servers { get; init; } = [];
}

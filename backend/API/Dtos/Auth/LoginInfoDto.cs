using System.ComponentModel.DataAnnotations;

namespace API.Dtos.Auth;

public record LoginInfoDto
{
    [Required]
    public required string Username { get; set; }

    [Required]
    [MinLength(12)]
    public required string Password { get; set; }
}

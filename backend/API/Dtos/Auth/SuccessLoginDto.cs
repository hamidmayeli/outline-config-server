namespace API.Dtos.Auth;

public record SuccessLoginDto(int UserId, string Username, string Token);

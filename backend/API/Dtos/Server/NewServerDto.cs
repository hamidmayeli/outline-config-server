namespace API.Dtos.Server;

public record NewServerDto(string ApiUrl, string CertSha256, Guid? CopyFrom);

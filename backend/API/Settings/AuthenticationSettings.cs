namespace API.Settings;

public class AuthenticationSettings
{
    public required string Secret { get; set; }
    public required string Issuer { get; set; }
    public int TimeOutInDays { get; set; }
    public int AccessTokenTimeOut { get; set; }
}

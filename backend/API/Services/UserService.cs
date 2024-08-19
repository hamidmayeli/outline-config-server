using API.Models;
using API.Settings;
using LiteDB;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace API.Services;

public interface IUserService
{
    Task<UserModel?> Get(string username, string password);

    Task<UserModel> Create(string username, string password);

    Task<string> GenerateAccessToken(UserModel user);

    Task<RefreshTokenModel> GenerateRefreshToken(UserModel user);

    Task<(UserModel?, RefreshTokenModel?)> Validate(string id);

    Task<bool> HasAnyUser();

    Task DeleteRefreshToken(string token);
}

public class UserService(
    ILiteDatabase _database,
    ILogger<UserService> _logger,
    IDateTimeService _dateTimeService,
    IOptions<AuthenticationSettings> _authenticationSettings
    ) : IUserService
{
    ILiteCollection<UserModel> Users => _database.GetCollection<UserModel>();

    ILiteCollection<RefreshTokenModel> RefreshTokens => _database.GetCollection<RefreshTokenModel>();

    public Task<UserModel> Create(string username, string password)
    {
        _logger.LogInformation("Creating a new user '{user}'", username);

        username = username.ToLowerInvariant();

        if (Users.Find(x => x.Username == username).Any())
            throw new DuplicationException();

        var salt = GenerateSalt();

        var user = new UserModel
        {
            Salt = salt,
            Username = username,
            Password = HashPassword(password, salt)
        };

        Users.Insert(user);
        Users.EnsureIndex(x => x.Username);

        return Task.FromResult(user);
    }

    public Task<string> GenerateAccessToken(UserModel user)
    {
        var key = Encoding.ASCII.GetBytes(_authenticationSettings.Value.Secret);
        var issuer = _authenticationSettings.Value.Issuer;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([new Claim(ClaimTypes.Name, user.Id.ToString())]),
            Expires = _dateTimeService.UtcNow.AddMinutes(_authenticationSettings.Value.AccessTokenTimeOut),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256),
            Issuer = issuer,
            Audience = issuer,
            IssuedAt = DateTime.UtcNow,
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenObject = tokenHandler.CreateToken(tokenDescriptor);

        _logger.LogDebug("A new access token generated for {userId}", user.Id);

        return Task.FromResult(tokenHandler.WriteToken(tokenObject));
    }

    public Task<RefreshTokenModel> GenerateRefreshToken(UserModel user)
    {
        var token = new RefreshTokenModel
        {
            Token = Guid.NewGuid().ToString().ToLower(),
            UserId = user.Id,
            Expiry = _dateTimeService.UtcNow.AddDays(_authenticationSettings.Value.TimeOutInDays)
        };

        RefreshTokens.Insert(token);

        RefreshTokens.EnsureIndex(x => x.UserId);
        RefreshTokens.EnsureIndex(x => x.Expiry);

        return Task.FromResult(token);
    }

    public Task<UserModel?> Get(string username, string password)
    {
        username = username.ToLowerInvariant();

        var user = Users.FindOne(x => x.Username == username);

        if (user == null || user.Password != HashPassword(password, user.Salt))
            return Task.FromResult<UserModel?>(null);

        return Task.FromResult< UserModel?>(user);
    }

    public Task<bool> HasAnyUser() => Task.FromResult(Users.Count() > 0);

    public Task<(UserModel?, RefreshTokenModel?)> Validate(string id)
    {
        var token = RefreshTokens.FindById(id);

        if(token == null || token.Expiry <= _dateTimeService.UtcNow)
            return Task.FromResult<(UserModel?, RefreshTokenModel?)>((null, null));

        var user = Users.FindById(token.UserId);

        if(user == null)
            return Task.FromResult<(UserModel?, RefreshTokenModel?)>((null, null));

        return Task.FromResult<(UserModel?, RefreshTokenModel?)>((user, token));
    }

    public Task DeleteRefreshToken(string token)
    {
        RefreshTokens.DeleteMany(x => x.Token == token.ToLower());
        return Task.CompletedTask;
    }

    private static byte[] GenerateSalt(int size = 16)
        => RandomNumberGenerator.GetBytes(size);

    private static string HashPassword(string password, byte[] salt)
    {
        // Combine the password and salt into a single array
        var combined = Combine(Encoding.UTF8.GetBytes(password), salt);

        // Compute the hash
        var hash = SHA512.HashData(combined);

        // Convert the hash to a string for storage
        return Convert.ToBase64String(hash);
    }

    private static byte[] Combine(byte[] first, byte[] second)
    {
        var combined = new byte[first.Length + second.Length];
        Buffer.BlockCopy(first, 0, combined, 0, first.Length);
        Buffer.BlockCopy(second, 0, combined, first.Length, second.Length);
        return combined;
    }
}

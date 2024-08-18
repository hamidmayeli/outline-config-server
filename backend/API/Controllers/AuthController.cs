using API.Dtos.Auth;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AuthController(
    IUserService _userService
    ) : ApiController
{
    internal const string RefreshTokenCookieKey = "RefreshToken";

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<Results<NoContent, Ok<SuccessLoginDto>>> Login([FromBody] LoginInfoDto loginInfo)
    {
        var user = _userService.HasAnyUser() 
            ? _userService.Get(loginInfo.Username, loginInfo.Password)
            : _userService.Create(loginInfo.Username, loginInfo.Password);

        if (user is not null)
        {
            var refreshToken = _userService.GenerateRefreshToken(user);

            return TypedResults.Ok(CreateCookieAndDto(user, refreshToken));
        }
        else
            return TypedResults.NoContent();
    }

    [HttpGet("refreshToken")]
    [AllowAnonymous]
    public async Task<Results<ForbidHttpResult, Ok<SuccessLoginDto>>> RefreshToken()
    {
        var token = Request.Cookies[RefreshTokenCookieKey];

        if (string.IsNullOrWhiteSpace(token))
            return TypedResults.Forbid();

        var (user, refreshToken) = _userService.Validate(token);

        if (user is null || refreshToken is null)
            return TypedResults.Forbid();

        return TypedResults.Ok(CreateCookieAndDto(user, refreshToken));
    }

    private SuccessLoginDto CreateCookieAndDto(UserModel user, RefreshTokenModel refreshToken)
    {
        Response.Cookies.Append(
            RefreshTokenCookieKey,
            refreshToken.Token,
            new()
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                Expires = refreshToken.Expiry,
                IsEssential = true,
                SameSite = SameSiteMode.Strict,
            });

        return new SuccessLoginDto(
            user.Id,
            user.Username,
            _userService.GenerateAccessToken(user));
    }
}

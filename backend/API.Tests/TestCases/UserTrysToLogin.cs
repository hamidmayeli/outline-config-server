using API.Dtos.Auth;
using API.Models;
using LiteDB;
using NUnit.Framework.Internal;
using System.Net.Http.Json;
using Shouldly;
using System.Net;

namespace API.Tests.TestCases;

internal class UserTrysToLogin : TestCaseBase
{
    private ILiteCollection<UserModel> _users = default!;

    public override async Task Setup()
    {
        await base.Setup();
        _users = _fixture.LiteDatabase.GetCollection<UserModel>();
    }

    [Test]
    public async Task ForTheFirstTime()
    {
        // Arrange
        var client = _fixture.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/v1/Auth/Login", new
        {
            Username = "test",
            Password = "testtesttest"
        });

        // Assert
        await AssertToken(response);
        _users.Count().ShouldBe(1);
    }

    [Test]
    public async Task WithInvalidCredentials_ReturnsNoContent()
    {
        // Arrange
        _users.Insert(new UserModel
        {
            Id = 1,
            Username = "test",
            Password = "testtest",
            Salt = [1, 2, 3],
        });

        var client = _fixture.CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/v1/Auth/Login", new
        {
            Username = "test",
            Password = "test1234567890"
        });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
    }

    [Test]
    public async Task WithValidCredentials_ReturnsOk()
    {
        // Arrange
        var client = _fixture.CreateClient();
        await _fixture.CreateUser("test", "testtesttest");

        // Act
        var response = await client.PostAsJsonAsync("/api/v1/Auth/Login", new
        {
            Username = "test",
            Password = "testtesttest"
        });

        // Assert
        await AssertToken(response);
    }

    private async Task AssertToken(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var result = System.Text.Json.JsonSerializer.Deserialize<SuccessLoginDto>(json, _fixture.SerializerOptions);

        result.ShouldNotBeNull();
        result.Token.ShouldNotBeNullOrWhiteSpace();
    }
}

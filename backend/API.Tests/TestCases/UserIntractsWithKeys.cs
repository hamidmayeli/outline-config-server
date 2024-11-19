using API.Models;
using NSubstitute;
using Shouldly;
using System.Net;
using System.Net.Http.Json;

namespace API.Tests.TestCases;

internal class UserIntractsWithKeys : TestCaseBase
{
    private HttpClient _client = default!;
    private ServerModel _server = default!;

    public override async Task Setup()
    {
        await base.Setup();

        var password = "passwordpassword";
        var username = "user";

        var user = await _fixture.CreateUser(username, password);
        _client = await _fixture.GetHttpClient(user);

        _server = CreateServer(Guid.NewGuid());

        user.Servers.Add(_server);
        _fixture.Users.Update(user);
    }

    [Test]
    public async Task UserCanAddNewKey()
    {
        // Arrange
        var request = new KeyRequest
        {
            Name = "Key",
            Limit = new()
            {
                Bytes = 1_000_000,
            },
        };

        _fixture.OutlineServerClient
            .CreateKey(_server.ApiPrefix, Arg.Is<KeyRequest>(x => x.Name == "Key"))
            .Returns(new AccessKeyResponse
            (
                "id",
                request.Name,
                "http://access.url",
                request.Limit
            ));

        // Act
        var response = await _client.PostAsJsonAsync($"/api/v1/key/{_server.ServerId}", request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var key = await response.Content.ReadFromJsonAsync<AccessKeyResponse>();
        key.ShouldNotBeNull();
        key.DataLimit.Bytes.ShouldBe(request.Limit.Bytes);
    }

    [Test]
    public async Task UserCanDeleteKey()
    {
        // Arrange
        var keyId = "keyId";

        // Act
        var response = await _client.DeleteAsync($"/api/v1/key/{_server.ServerId}/{keyId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        await _fixture.OutlineServerClient
            .Received(1).DeleteAccessKey(_server.ApiPrefix, keyId);
    }

    [Test]
    public async Task UserCanUpdateKey()
    {
        // Arrange
        var keyId = "keyId";
        var request = new KeyRequest
        {
            Name = "Key",
            Limit = new()
            {
                Bytes = 1_000_000,
            },
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/key/{_server.ServerId}/{keyId}", request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        await _fixture.OutlineServerClient
            .Received(1).SetKeyName(_server.ApiPrefix, keyId, new(request.Name));

        await _fixture.OutlineServerClient
            .Received(1).SetLimit(_server.ApiPrefix, keyId, new(request.Limit));
    }
}

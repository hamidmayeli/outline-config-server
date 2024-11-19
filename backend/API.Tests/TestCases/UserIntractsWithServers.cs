using API.Dtos.Auth;
using API.Dtos.Server;
using API.Models;
using NSubstitute;
using Shouldly;
using System.Net;
using System.Net.Http.Json;

namespace API.Tests.TestCases;

internal class UserIntractsWithServers : TestCaseBase
{
    private UserModel _user = default!;
    private HttpClient _client = default!;
    private readonly LoginInfoDto _loginIfno = new() { Password = "passwordpassword", Username = "user" };

    public override async Task Setup()
    {
        await base.Setup();

        _user = await _fixture.CreateUser(_loginIfno.Username, _loginIfno.Password);
        _client = await _fixture.GetHttpClient(_user);
    }

    [Test]
    public async Task WhenUserHasNoServer_ReturnsEmptyCollection()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/server");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var servers = await response.Content.ReadFromJsonAsync<List<ServerDto>>();
        servers.ShouldBeEmpty();
    }

    [Test]
    public async Task WhenUserHasServer_ReturnsAll()
    {
        // Arange
        _user.Servers.Add(CreateServer(Guid.NewGuid()));
        _fixture.Users.Update(_user);

        // Act
        var response = await _client.GetAsync("/api/v1/server");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var servers = await response.Content.ReadFromJsonAsync<List<ServerDto>>();
        servers.ShouldNotBeEmpty();
    }

    [Test]
    public async Task WhenAddNewServer_ItUpdatesUser()
    {
        // Arrange
        _fixture.OutlineServerClient
            .GetServerInfo("prefix")
            .Returns(new ServerInfo
            {
                HostnameForAccessKeys = "HNFAK",
                Name = "Name",
                Version = "1.0",
            });

        // Act
        var response = await _client.PostAsJsonAsync(
            "/api/v1/server",
            new NewServerDto("http://server.com/prefix", "", null)
            );

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var server = await response.Content.ReadFromJsonAsync<ServerInfo>();
        server.ShouldNotBeNull();
        server.HostnameForAccessKeys.ShouldBe("HNFAK");
        _fixture.OutlineServerClientFactory
            .Received(1).Create("http://server.com/prefix");
    }

    [Test]
    public async Task CanGetServerInfo_ById()
    {
        // Arrange
        var server = CreateServer(Guid.NewGuid());
        _user.Servers.Add(server);
        _fixture.Users.Update(_user);

        _fixture.OutlineServerClient
            .GetServerInfo(server.ApiPrefix)
            .Returns(new ServerInfo
            {
                HostnameForAccessKeys = "HNFAK",
                Name = "Name",
                Version = "1.0",
            });

        // Act
        var response = await _client.GetAsync($"/api/v1/server/{server.ServerId}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var serverInfo = await response.Content.ReadFromJsonAsync<ServerInfo>();
        serverInfo.ShouldNotBeNull();
        serverInfo.HostnameForAccessKeys.ShouldBe("HNFAK");
    }

    [Test]
    public async Task WhenDeleteServer_ItUpdatesUser()
    {
        // Arrange
        var server = CreateServer(Guid.NewGuid());
        _user.Servers.Add(server);
        _fixture.Users.Update(_user);
        // Act
        var response = await _client.DeleteAsync($"/api/v1/server/{server.ServerId}");
        ReloadUser();
        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        _user.Servers?.ShouldNotContain(server);
    }

    [Test]
    public async Task WhenHasServer_CanGetKeys()
    {
        // Arrange
        var server = CreateServer(Guid.NewGuid());
        _user.Servers.Add(server);
        _fixture.Users.Update(_user);

        _fixture.OutlineServerClient
            .GetAccessKey(server.ApiPrefix)
            .Returns(new AccessKeyCollectionResponse([
                    new AccessKeyResponse("k-id", "k-name", "accessUrl", null),
                ]));
        
        // Act
        var response = await _client.GetAsync($"/api/v1/server/{server.ServerId}/keys");
        
        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var keys = await response.Content.ReadFromJsonAsync<List<LocalAccessKey>>();
        keys.ShouldNotBeEmpty();
    }

    [Test]
    public async Task WhenHasServer_CanSetItsName()
    {
        // Arrange
        var server = CreateServer(Guid.NewGuid());
        _user.Servers.Add(server);
        _fixture.Users.Update(_user);

        // Act
        var response = await _client.PutAsJsonAsync($"/api/v1/server/{server.ServerId}/name", new SetNameRequest("new name"));
        
        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        await _fixture.OutlineServerClient.Received(1).SetServerName(server.ApiPrefix, new("new name"));
    }

    private void ReloadUser() =>
        _user = _fixture.Users.FindOne(x => x.Username == _user.Username);
}

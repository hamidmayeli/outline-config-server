using API.Models;
using Shouldly;
using System.Net;
using System.Net.Http.Json;

namespace API.Tests.TestCases;

internal class UserIntractsWithConfigs : TestCaseBase
{
    private HttpClient _client = default!;
    private LocalKey _locakKey = default!;

    private LiteDB.ILiteCollection<LocalKey> LocalKeys => _fixture.LiteDatabase.GetCollection<LocalKey>();

    public override async Task Setup()
    {
        await base.Setup();

        var user = await _fixture.CreateUser("user", "PasswordPassword");
        _client = await _fixture.GetHttpClient(user);

        _locakKey = new LocalKey
        {
            AccessKey = "ss://access.key",
            ConfigUrl = "http://config.url",
            Name = "Config",
            Id = Guid.NewGuid(),
        };

        LocalKeys.Insert(_locakKey);
    }

    [Test]
    public async Task UserCanGetConfig()
    {
        // Act
        var response = await _fixture.CreateClient()
            .GetAsync($"/api/v1/config/{_locakKey.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var key = await response.Content.ReadAsStringAsync();
        key.ShouldNotBeNull();
        key.ShouldBe(_locakKey.AccessKey);
    }

    [Test]
    public async Task UserCanGetAllConfigs()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/config");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var keys = await response.Content.ReadFromJsonAsync<List<LocalKey>>();
        keys.ShouldNotBeEmpty();
        keys.ShouldContain(x => x.Id == _locakKey.Id);
    }

    [Test]
    public async Task UserCanAddNewConfig()
    {
        // Arrange
        var request = new LocalKey
        {
            AccessKey = "ss://new",
            ConfigUrl = "http://new.url",
            Name = "New",
            Id = Guid.NewGuid(),
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/config", request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        LocalKeys.FindById(request.Id).ShouldNotBeNull();
        LocalKeys.Count().ShouldBe(2);
    }

    [Test]
    public async Task UserCanUpdateConfig()
    {
        // Arrange
        var request = new LocalKey
        {
            AccessKey = _locakKey.AccessKey,
            ConfigUrl = _locakKey.ConfigUrl,
            Name = "Updated",
            Id = _locakKey.Id,
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/config", request);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        LocalKeys.Count().ShouldBe(1);
    }

    [Test]
    public async Task UserCanDeleteConfig()
    {
        // Act
        var response = await _client.DeleteAsync($"/api/v1/config/{_locakKey.Id}");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        LocalKeys.Count().ShouldBe(0);
    }
}

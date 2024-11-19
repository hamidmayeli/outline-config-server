using API.Models;

namespace API.Tests.TestCases;

internal abstract class TestCaseBase
{
    protected TestFixture _fixture = default!;

    protected static ServerModel CreateServer(Guid id)
    {
        return new()
        {
            ApiUrl = $"http://server.com/{id}",
            Name = $"Server {id}",
            ServerId = id,
        };
    }

    [SetUp]
    public virtual Task Setup()
    {
        _fixture = new TestFixture();

        return Task.CompletedTask;
    }

    [TearDown]
    public async Task TearDownFixture()
    {
        if (_fixture != null)
        {
            await _fixture.DisposeAsync();
        }
    }
}

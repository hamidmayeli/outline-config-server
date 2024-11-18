namespace API.Tests.TestCases;

internal abstract class TestCaseBase
{
    protected TestFixture _fixture = default!;

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

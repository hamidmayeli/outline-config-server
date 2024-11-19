using API.Models;
using API.Services;
using LiteDB;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;
using System.Text.Json;

namespace API.Tests;

internal class TestFixture : WebApplicationFactory<Program>
{
    public LiteDatabase LiteDatabase { get; } = new LiteDatabase(new MemoryStream());

    public ILiteCollection<UserModel> Users => LiteDatabase.GetCollection<UserModel>();

    public IOutlineServerClientFactory OutlineServerClientFactory { get; } = Substitute.For<IOutlineServerClientFactory>();

    public IOutlineServerClient OutlineServerClient { get; } = Substitute.For<IOutlineServerClient>();

    public JsonSerializerOptions? SerializerOptions { get; } = new ()
    {
        PropertyNameCaseInsensitive = true
    };

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        OutlineServerClientFactory
            .Create(Arg.Any<string>())
            .Returns(OutlineServerClient);

        builder.ConfigureServices(services =>
        {
            services.AddSingleton<ILiteDatabase>(LiteDatabase);
            services.AddSingleton(OutlineServerClientFactory);

            var hostedServiceDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IHostedService) && d.ImplementationType == typeof(TimedHostedService));
            if (hostedServiceDescriptor != null)
                services.Remove(hostedServiceDescriptor);
        });

        base.ConfigureWebHost(builder);
    }

    public async Task<UserModel> CreateUser(string username = "test", string password = "testtesttest")
    {
        var userService = Services.GetRequiredService<IUserService>();
        return await userService.Create(username, password);
    }

    override protected void Dispose(bool disposing)
    {
        if (disposing)
        {
            LiteDatabase.Dispose();
        }
        base.Dispose(disposing);
    }

    public async Task<HttpClient> GetHttpClient(UserModel user)
    {
        var token = await Services.GetRequiredService<IUserService>().GenerateAccessToken(user);

        var client = CreateClient();

        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

        return client;
    }
}

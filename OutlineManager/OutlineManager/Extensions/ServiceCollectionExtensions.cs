using LiteDB;
using Microsoft.Extensions.DependencyInjection;
using OutlineManager.Services;

namespace OutlineManager.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDb(this IServiceCollection services)
    {
        return services.AddSingleton<ILiteDatabase>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();

            var dbPath = config.GetSection("DatabasePath").Get<string>()
                ?? throw new Exception("Db setting is missing.");

            if(!Path.IsPathRooted(dbPath))
                dbPath = Path.Combine(
                    Directory.GetCurrentDirectory(), 
                    dbPath);

            Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);

            return new LiteDatabase(dbPath);
        });
    }

    public static IServiceCollection AddProjectServices(this IServiceCollection services)
    {
        return services
            .AddTransient<IServerService, ServerService>()
            .AddTransient<Services.IHttpClientFactory, HttpClientFactory>()
            .AddTransient<IKeyService, KeyService>();
    }
}

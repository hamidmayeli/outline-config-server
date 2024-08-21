using API.Services;
using LiteDB;

namespace API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDb(this IServiceCollection services)
    {
        return services.AddSingleton<ILiteDatabase>(sp =>
        {
            var config = sp.GetRequiredService<IConfiguration>();

            var dbPath = config.GetSection("DatabasePath").Get<string>()
                ?? throw new MissingSettingException("DatabasePath");

            if (!Path.IsPathRooted(dbPath))
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
            .AddTransient<IOutlineServerClientFactory, OutlineServerClientFactory>()
            .AddTransient<IDateTimeService, DateTimeService>()
            .AddTransient<IUserService, UserService>()
            .AddTransient<IServerService, ServerService>()
            .AddTransient<ILocalKeyService, LocalKeyService>()
            .AddTransient<IKeyService, KeyService>()
            .AddHttpContextAccessor();
    }
}

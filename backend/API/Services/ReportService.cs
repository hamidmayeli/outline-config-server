using API.Models;
using API.Settings;
using Microsoft.Extensions.Options;
using System.Text;
using LiteDB;
using Json = System.Text.Json.JsonSerializer;

namespace API.Services;

public interface IReportService
{
    Task Add(UsageSnapshot snapshot);
    Task Delete(int olderThanDays);
    Task<IEnumerable<UsageSnapshot>> Get(int count);
    Task<IEnumerable<HourlyUsage>> GetHourly(int count);
    Task ClearHourlyLogs();
}

public class ReportService(
    IOptions<ReportSettings> _options,
    IOutlineServerClientFactory _clientFactory,
    ILiteDatabase _database
    ) : IReportService
{
    private readonly string _rootFolder = _options.Value.LogFileFolders;
    private readonly string _hourlyRootFolder = _options.Value.HourlyLogFileFolders;

    public async Task Add(UsageSnapshot snapshot)
    {
        if (!Directory.Exists(_rootFolder))
            Directory.CreateDirectory(_rootFolder);

        var json = Json.Serialize(snapshot);

        await File.AppendAllLinesAsync(GetFilename(), [json]);
    }

    public async Task<IEnumerable<UsageSnapshot>> Get(int count)
    {
        var builder = new StringBuilder("[");

        while (count >= 0)
        {
            var filename = GetFilename(count--);

            if (!File.Exists(filename))
                continue;

            var lines = await File.ReadAllLinesAsync(filename);

            for (int index = 0; index < lines.Length; index++)
            {
                builder.Append(lines[index]);

                if (count >= 0 || index < lines.Length - 1)
                    builder.Append(',');
            }
        }

        builder.Append(']');

        var result = Json.Deserialize<List<UsageSnapshot>>(builder.ToString()) ?? [];

        return result;
    }

    public async Task<IEnumerable<HourlyUsage>> GetHourly(int count)
    {
        var hostServer = GetHostServer();
        if (hostServer == null)
            return [];

        var keyNameMap = await GetKeyNameMapping(hostServer);

        var result = new List<HourlyUsage>();

        while (count >= 0)
        {
            var filename = GetHourlyFilename(count--);

            if (!File.Exists(filename))
                continue;

            var lines = await File.ReadAllLinesAsync(filename);

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var rawData = Json.Deserialize<HourlyUsageRaw>(line);
                if (rawData == null)
                    continue;

                var usage = rawData.Usage
                    .Where(x => x.Id != null)
                    .Select(x => new HourlyUsageItem(
                        x.Id,
                        keyNameMap.GetValueOrDefault(x.Id!, $"Unknown ({x.Id})"),
                        decimal.TryParse(x.Value, out var val) ? val : 0m
                    ));

                result.Add(new HourlyUsage(rawData.Time, usage));
            }
        }

        return result;
    }

    public Task ClearHourlyLogs()
    {
        var files = new HashSet<string>(Enumerable.Range(0, 60).Select(GetHourlyFilename));

        if (Directory.Exists(_hourlyRootFolder))
            foreach (var file in Directory.EnumerateFiles(_hourlyRootFolder, "??????.log"))
                if (!files.Contains(file))
                    File.Delete(file);

        return Task.CompletedTask;
    }

    public Task Delete(int olderThanDays)
    {
        var files = new HashSet<string>(Enumerable.Range(0, olderThanDays).Select(GetFilename));

        foreach (var filename in Directory.EnumerateFiles(_rootFolder, "??????.log"))
            if(!files.Contains(filename))
                File.Delete(filename);

        return Task.CompletedTask;
    }

    private ServerModel? GetHostServer()
    {
        var users = _database.GetCollection<UserModel>().FindAll();
        
        return users
            .SelectMany(x => x.Servers)
            .FirstOrDefault(x => x.IsHost);
    }

    private async Task<Dictionary<string, string>> GetKeyNameMapping(ServerModel server)
    {
        try
        {
            var client = _clientFactory.Create(server.ApiUrl);
            var keys = await client.GetAccessKey(server.ApiPrefix);

            return keys.AccessKeys.ToDictionary(x => x.Id, x => x.Name);
        }
        catch
        {
            return [];
        }
    }

    private string GetFilename(int delta = 0) => Path.Combine(_rootFolder, $"{DateTime.UtcNow.AddDays(-delta):yyMMdd}.log");

    private string GetHourlyFilename(int delta = 0) => Path.Combine(_hourlyRootFolder, $"{DateTime.UtcNow.AddDays(-delta):yyMMdd}.log");
}

using API.Models;
using API.Settings;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace API.Services;

public interface IReportService
{
    Task Add(UsageSnapshot snapshot);
    Task Delete(int olderThanDays);
    Task<IEnumerable<UsageSnapshot>> Get(int count);
}

public class ReportService(
    IOptions<ReportSettings> _options
    ) : IReportService
{
    private readonly string _rootFolder = _options.Value.LogFileFolders;

    public async Task Add(UsageSnapshot snapshot)
    {
        if (!Directory.Exists(_rootFolder))
            Directory.CreateDirectory(_rootFolder);

        var json = JsonSerializer.Serialize(snapshot);

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

        var result = JsonSerializer.Deserialize<List<UsageSnapshot>>(builder.ToString()) ?? [];

        return result;
    }

    public Task Delete(int olderThanDays)
    {
        var files = new HashSet<string>(Enumerable.Range(0, olderThanDays).Select(GetFilename));

        foreach (var filename in Directory.EnumerateFiles(_rootFolder, "??????.log"))
            if(!files.Contains(filename))
                File.Delete(filename);

        return Task.CompletedTask;
    }

    private string GetFilename(int delta = 0) => Path.Combine(_rootFolder, $"{DateTime.UtcNow.AddDays(-delta):yyMMdd}.log");
}

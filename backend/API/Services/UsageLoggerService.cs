using API.Models;
using LiteDB;

namespace API.Services;

public interface IUsageLoggerService
{
    Task Log();
}

public class UsageLoggerService(
        ILiteDatabase _database,
        IOutlineServerClientFactory _clientFactory,
        ILogger<UsageLoggerService> _logger,
        IReportService _reportService
        ) : IUsageLoggerService
{
    public Task Log() => Log(3);

    private async Task Log(int retry)
    {
        try
        {
            _logger.LogDebug("Start logging usage. Remaining try: {retry}", retry);

            await MainLog(_database, _clientFactory, _logger, _reportService);
        }
        catch (Exception excption)
        {
            _logger.LogError(excption, "Failed to get snapshot.");

            if (retry > 0)
                await Log(retry - 1);
        }
    }

    private static async Task MainLog(ILiteDatabase _database, IOutlineServerClientFactory _clientFactory, ILogger<UsageLoggerService> _logger, IReportService _reportService)
    {
        var users = _database.GetCollection<UserModel>()
            .FindAll();

        var servers = users
            .SelectMany(x => x.Servers)
            .DistinctBy(x => x.ApiUrl)
            .ToArray();

        var usageList = new Dictionary<string, long>();
        var details = new List<UsageDetail>();

        foreach (var server in servers)
        {
            try
            {
                var client = _clientFactory.Create(server.ApiUrl);
                var usage = await client.GetUsage(server.ApiPrefix);

                usageList.Add(
                    server.Name,
                    usage.BytesTransferredByUserId.Sum(x => x.Value)
                );

                var keys = (await client.GetAccessKey(server.ApiPrefix))
                    .AccessKeys.ToDictionary(x => x.Id, x => x.Name);

                string getKeyName(string id) => keys.TryGetValue(id, out var key) ? key : "deleted";

                details.AddRange(usage.BytesTransferredByUserId.Select(x => new UsageDetail(server.Name, getKeyName(x.Key), x.Value)));
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Failed to get the usage for {server}.", server.Name);
            }
        }

        var snapshot = new UsageSnapshot(DateTime.Now, usageList, details);

        await _reportService.Add(snapshot);

        _logger.LogDebug("A new usage snapshot created: {data}", snapshot);
    }
}

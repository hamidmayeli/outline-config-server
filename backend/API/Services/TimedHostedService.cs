using API.Settings;
using Microsoft.Extensions.Options;

namespace API.Services;

public class TimedHostedService(
    ILogger<TimedHostedService> _logger,
    IUsageLoggerService _usageLogger,
    IOptions<ReportSettings> _options
    ) : IHostedService, IDisposable
{
    private Timer? _timer;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Timed Hosted Service running.");
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(_options.Value.IntervalMinutes));
        return Task.CompletedTask;
    }

    private void DoWork(object? state) => _usageLogger.Log();

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Timed Hosted Service is stopping.");
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public void Dispose() => _timer?.Dispose();
}

using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ReportController(
    IReportService _reportService,
    IUsageLoggerService _usageLoggerService
    ) : ApiController
{
    [HttpGet]
    public async Task<Ok<IEnumerable<UsageSnapshot>>> Get(int count = 30)
        => TypedResults.Ok(await _reportService.Get(count));

    [HttpGet("hourly")]
    public async Task<Ok<IEnumerable<HourlyUsage>>> GetHourly(int count = 30 * 24)
        => TypedResults.Ok(await _reportService.GetHourly(count));

    [HttpPut]
    public async Task<NoContent> Create()
    {
        await _usageLoggerService.Log();
        return TypedResults.NoContent();
    }

    [HttpDelete("{olderThanDays}")]
    public async Task<NoContent> Delete(int olderThanDays)
    {
        await _reportService.Delete(olderThanDays);
        return TypedResults.NoContent();
    }
}

using API.Models;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ReportController(
    IReportService _reportService
    ) : ApiController
{
    [HttpGet]
    public async Task<Ok<IEnumerable<UsageSnapshot>>> Get(int count = 30)
        => TypedResults.Ok(await _reportService.Get(count));
}

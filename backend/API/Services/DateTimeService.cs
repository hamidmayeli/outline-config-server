namespace API.Services;

public interface IDateTimeService
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}

public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateTime Now => DateTime.Now;
}

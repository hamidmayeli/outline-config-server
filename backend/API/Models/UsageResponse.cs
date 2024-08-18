namespace API.Models;

public record UsageResponse(IDictionary<string, long> BytesTransferredByUserId);

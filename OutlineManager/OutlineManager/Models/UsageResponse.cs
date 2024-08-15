namespace Client.Models;

public record UsageResponse(IDictionary<string, long> BytesTransferredByUserId);

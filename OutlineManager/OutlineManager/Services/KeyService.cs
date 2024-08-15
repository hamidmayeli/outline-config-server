using Client.Models;
using OutlineManager.Models;

namespace OutlineManager.Services;

public interface IKeyService
{
    Task<IEnumerable<AccessKeyResponse>> GetAll(ServerModel serverModel);
}

public class KeyService(
    IHttpClientFactory _httpClientFactory
    ) : IKeyService
{
    public async Task<IEnumerable<AccessKeyResponse>> GetAll(ServerModel serverModel)
    {
        var client = _httpClientFactory.Create(serverModel.ApiUrl);


        try
        {
            var accessKeyCollection = await client.GetFromJsonAsync<AccessKeyCollectionResponse>($"{serverModel.GetApiPrefix()}/access-keys", JsonExtensions.Options)
                ?? throw new Exception("The collection is empty");

            var useage = await client.GetFromJsonAsync<UsageResponse>($"{serverModel.GetApiPrefix()}/metrics/transfer", JsonExtensions.Options);

            foreach (var key in accessKeyCollection.AccessKeys)
                if (useage?.BytesTransferredByUserId.TryGetValue(key.Id, out var value) == true)
                    key.DataLimit.Consumed = value;

            return accessKeyCollection.AccessKeys;
        }
        catch (Exception exception)
        {
            return [];
        }
    }
}

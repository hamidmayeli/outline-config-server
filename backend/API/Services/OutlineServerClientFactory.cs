using Refit;

namespace API.Services;

public interface IOutlineServerClientFactory
{
    IOutlineServerClient Create(string apiUrl);
}

public class OutlineServerClientFactory : IOutlineServerClientFactory
{
    public IOutlineServerClient Create(string apiUrl)
    {
        var uri = new Uri(apiUrl);

        var handler = new HttpClientHandler
        {
            ClientCertificateOptions = ClientCertificateOption.Manual,
            ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true,
        };

        return RestService.For<IOutlineServerClient>(new HttpClient(handler)
        {
            BaseAddress = new Uri($"{uri.Scheme}://{uri.Host}:{uri.Port}"),
        });
    }
}

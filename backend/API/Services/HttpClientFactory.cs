namespace API.Services;

public interface IHttpClientFactory
{
    HttpClient Create(string apiUrl);
}

public class HttpClientFactory : IHttpClientFactory
{
    public HttpClient Create(string apiUrl)
    {
        var uri = new Uri(apiUrl);

        var handler = new HttpClientHandler
        {
            ClientCertificateOptions = ClientCertificateOption.Manual,
            ServerCertificateCustomValidationCallback = (httpRequestMessage, cert, cetChain, policyErrors) => true,
        };

        return new(handler)
        {
            BaseAddress = new Uri($"{uri.Scheme}://{uri.Host}:{uri.Port}"),
        };
    }
}

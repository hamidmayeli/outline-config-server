namespace Client.Services;

public interface IHttpClientFactory
{
    HttpClient Create(string apiUrl);
}

public class HttpClientFactory : IHttpClientFactory
{
    public HttpClient Create(string apiUrl)
    {
        var uri = new Uri(apiUrl);

        return new()
        {
            BaseAddress = new Uri($"{uri.Scheme}://{uri.Host}:{uri.Port}"),
        };
    }
}

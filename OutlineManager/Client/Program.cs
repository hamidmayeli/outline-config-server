using Client;
using Client.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services
    .AddTransient<IHttpClientFactory, HttpClientFactory>()
    .AddTransient<ILocalStorage, LocalStorage>()
    .AddTransient<IServerCollection, ServerCollection>();

try
{
    var handler = new HttpClientHandler
    {
        ClientCertificateOptions = ClientCertificateOption.Manual,
        ServerCertificateCustomValidationCallback =
        (httpRequestMessage, cert, cetChain, policyErrors) =>
        {
            return true;
        }
    };


    var res = await new HttpClient(handler).GetAsync("https://65.109.136.251:45082/TiYoJV3SLZz3SFtL4Ej9pA/access-keys");
}
catch (Exception ex)
{

}

await builder.Build().RunAsync();

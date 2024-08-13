using Microsoft.JSInterop;
using System.Text.Json;

namespace Client.Services;

public interface ILocalStorage
{
    ValueTask Remove(string key);
    ValueTask<T?> Get<T>(string key);
    ValueTask Set<T>(string key, T value);
}


public class LocalStorage(
    IJSRuntime _jsRuntime
    ) : ILocalStorage
{
    public ValueTask Set<T>(string key, T value)
        => _jsRuntime.InvokeVoidAsync("localStorage.setItem", key, JsonSerializer.Serialize(value));

    public async ValueTask<T?> Get<T>(string key)
    {
        var json = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", key);

        if(string.IsNullOrWhiteSpace(json)) return default;

        return JsonSerializer.Deserialize<T>(json);
    }

    public ValueTask Remove(string key) => _jsRuntime.InvokeVoidAsync("localStorage.removeItem", key);
}

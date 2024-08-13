using Microsoft.JSInterop;

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
        => _jsRuntime.InvokeVoidAsync("localStorage.setItem", key, value?.ToJson());

    public async ValueTask<T?> Get<T>(string key)
    {
        var json = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", key);

        if(string.IsNullOrWhiteSpace(json)) return default;

        return json.FromJson<T>();
    }

    public ValueTask Remove(string key) => _jsRuntime.InvokeVoidAsync("localStorage.removeItem", key);
}

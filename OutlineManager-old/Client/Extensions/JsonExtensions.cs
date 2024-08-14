using System.Text.Json;

namespace Client.Extensions;

public static class JsonExtensions
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static string ToJson(this object @object)
        => JsonSerializer.Serialize(@object, Options);

    public static T? FromJson<T>(this string json)
        => JsonSerializer.Deserialize<T>(json, Options);
}

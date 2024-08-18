namespace API;

public class MissingSettingException(string settingName) : Exception($"The setting '{settingName}' is missing.") { }

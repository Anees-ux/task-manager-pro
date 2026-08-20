using System.Text.Json.Serialization;

namespace TaskManager.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    Viewer = 0,
    Developer = 1,
    Manager = 2,
    Admin = 3
}

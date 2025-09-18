using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto?> GetUserByIdAsync(string userId);
        Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request);
        Task<bool> ValidatePasswordAsync(string password, string hashedPassword);
        string HashPassword(string password);
        string GenerateJwtToken(UserDto user);
    }
}

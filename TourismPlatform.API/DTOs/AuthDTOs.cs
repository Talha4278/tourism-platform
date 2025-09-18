using System.ComponentModel.DataAnnotations;

namespace TourismPlatform.API.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        [Required]
        public string UserType { get; set; } = string.Empty; // "tourist" or "agency"
        
        // Agency specific fields
        [MaxLength(200)]
        public string? AgencyName { get; set; }
        
        [MaxLength(1000)]
        public string? AgencyDescription { get; set; }
        
        [MaxLength(1000)]
        public string? AgencyServices { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public UserDto? User { get; set; }
        public string? Message { get; set; }
    }

    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string UserType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public AgencyProfileDto? AgencyProfile { get; set; }
    }

    public class AgencyProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string AgencyName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Services { get; set; }
    }

    public class UpdateProfileRequest
    {
        [MaxLength(100)]
        public string? Name { get; set; }
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        // Agency specific fields
        [MaxLength(200)]
        public string? AgencyName { get; set; }
        
        [MaxLength(1000)]
        public string? AgencyDescription { get; set; }
        
        [MaxLength(1000)]
        public string? AgencyServices { get; set; }
    }
}

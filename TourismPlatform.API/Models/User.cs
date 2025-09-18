using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismPlatform.API.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string UserType { get; set; } = string.Empty; // "tourist" or "agency"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual AgencyProfile? AgencyProfile { get; set; }
        public virtual ICollection<Tour> Tours { get; set; } = new List<Tour>();
        public virtual ICollection<Booking> TouristBookings { get; set; } = new List<Booking>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
    
    public class AgencyProfile
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("User")]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string AgencyName { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [MaxLength(1000)]
        public string? Services { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
    }
}

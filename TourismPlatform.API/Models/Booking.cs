using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismPlatform.API.Models
{
    public class Booking
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("Tour")]
        public string TourId { get; set; } = string.Empty;
        
        [Required]
        [ForeignKey("User")]
        public string TouristUserId { get; set; } = string.Empty;
        
        [Required]
        public int NumberOfPeople { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, confirmed, cancelled, completed
        
        [MaxLength(500)]
        public string? SpecialRequests { get; set; }
        
        [MaxLength(100)]
        public string? ContactPhone { get; set; }
        
        [MaxLength(255)]
        public string? ContactEmail { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Tour Tour { get; set; } = null!;
        public virtual User TouristUser { get; set; } = null!;
    }
}

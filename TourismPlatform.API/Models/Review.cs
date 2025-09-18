using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismPlatform.API.Models
{
    public class Review
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
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [MaxLength(1000)]
        public string? Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual Tour Tour { get; set; } = null!;
        public virtual User TouristUser { get; set; } = null!;
    }
}

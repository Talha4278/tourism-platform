using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismPlatform.API.Models
{
    public class Tour
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Destination { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public int Duration { get; set; } // in days
        
        [Required]
        public int MaxGroupSize { get; set; } = 10;
        
        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }
        
        [MaxLength(500)]
        public string? ImageUrl { get; set; }
        
        [MaxLength(1000)]
        public string? Itinerary { get; set; }
        
        [MaxLength(500)]
        public string? Inclusions { get; set; }
        
        [MaxLength(500)]
        public string? Exclusions { get; set; }
        
        [Required]
        public bool IsActive { get; set; } = true;
        
        [Required]
        [ForeignKey("User")]
        public string AgencyUserId { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User AgencyUser { get; set; } = null!;
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

using System.ComponentModel.DataAnnotations;

namespace TourismPlatform.API.DTOs
{
    public class CreateTourRequest
    {
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
        [Range(1, 365)]
        public int Duration { get; set; }
        
        [Required]
        [Range(1, 50)]
        public int MaxGroupSize { get; set; } = 10;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [MaxLength(500)]
        public string? ImageUrl { get; set; }
        
        [MaxLength(1000)]
        public string? Itinerary { get; set; }
        
        [MaxLength(500)]
        public string? Inclusions { get; set; }
        
        [MaxLength(500)]
        public string? Exclusions { get; set; }
    }

    public class UpdateTourRequest
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(100)]
        public string? Destination { get; set; }
        
        [MaxLength(50)]
        public string? Category { get; set; }
        
        [Range(1, 365)]
        public int? Duration { get; set; }
        
        [Range(1, 50)]
        public int? MaxGroupSize { get; set; }
        
        [Range(0.01, double.MaxValue)]
        public decimal? Price { get; set; }
        
        [MaxLength(500)]
        public string? ImageUrl { get; set; }
        
        [MaxLength(1000)]
        public string? Itinerary { get; set; }
        
        [MaxLength(500)]
        public string? Inclusions { get; set; }
        
        [MaxLength(500)]
        public string? Exclusions { get; set; }
        
        public bool? IsActive { get; set; }
    }

    public class TourDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int MaxGroupSize { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? Itinerary { get; set; }
        public string? Inclusions { get; set; }
        public string? Exclusions { get; set; }
        public bool IsActive { get; set; }
        public string AgencyUserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserDto? AgencyUser { get; set; }
    }

    public class TourFilters
    {
        public string? Destination { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Category { get; set; }
        public string? Duration { get; set; } // "1", "2-3", "4-7", "7+"
    }

    public class TourListResponse
    {
        public List<TourDto> Tours { get; set; } = new List<TourDto>();
        public int TotalCount { get; set; }
    }
}

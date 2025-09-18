using System.ComponentModel.DataAnnotations;

namespace TourismPlatform.API.DTOs
{
    public class CreateReviewRequest
    {
        [Required]
        public string TourId { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [MaxLength(1000)]
        public string? Comment { get; set; }
    }

    public class UpdateReviewRequest
    {
        [Range(1, 5)]
        public int? Rating { get; set; }
        
        [MaxLength(1000)]
        public string? Comment { get; set; }
    }

    public class ReviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string TourId { get; set; } = string.Empty;
        public string TouristUserId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserDto? TouristUser { get; set; }
    }

    public class TourRatingDto
    {
        public int Count { get; set; }
        public double Average { get; set; }
        public Dictionary<int, int> Distribution { get; set; } = new Dictionary<int, int>();
    }

    public class AgencyRatingDto
    {
        public int Count { get; set; }
        public double Average { get; set; }
    }
}

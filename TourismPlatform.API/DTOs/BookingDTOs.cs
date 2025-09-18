using System.ComponentModel.DataAnnotations;

namespace TourismPlatform.API.DTOs
{
    public class CreateBookingRequest
    {
        [Required]
        public string TourId { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 50)]
        public int NumberOfPeople { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        [MaxLength(500)]
        public string? SpecialRequests { get; set; }
        
        [MaxLength(100)]
        public string? ContactPhone { get; set; }
        
        [MaxLength(255)]
        public string? ContactEmail { get; set; }
    }

    public class UpdateBookingStatusRequest
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // pending, confirmed, cancelled, completed
    }

    public class BookingDto
    {
        public string Id { get; set; } = string.Empty;
        public string TourId { get; set; } = string.Empty;
        public string TouristUserId { get; set; } = string.Empty;
        public int NumberOfPeople { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? SpecialRequests { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public TourDto? Tour { get; set; }
        public UserDto? TouristUser { get; set; }
    }

    public class BookingStatsDto
    {
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ConfirmedBookings { get; set; }
        public int PendingBookings { get; set; }
        public double AverageRating { get; set; }
        public int ActiveTours { get; set; }
    }
}

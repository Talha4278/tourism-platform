using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Services
{
    public interface IBookingService
    {
        Task<BookingDto?> CreateBookingAsync(CreateBookingRequest request, string touristUserId);
        Task<List<BookingDto>> GetBookingsByTouristAsync(string touristUserId);
        Task<List<BookingDto>> GetBookingsByAgencyAsync(string agencyUserId);
        Task<BookingDto?> GetBookingByIdAsync(string bookingId);
        Task<BookingDto?> UpdateBookingStatusAsync(string bookingId, UpdateBookingStatusRequest request, string agencyUserId);
        Task<bool> CancelBookingAsync(string bookingId, string touristUserId);
        Task<BookingStatsDto> GetBookingStatsAsync(string agencyUserId);
        Task<List<BookingDto>> GetRecentBookingsByAgencyAsync(string agencyUserId, int limit = 10);
    }
}

using Microsoft.EntityFrameworkCore;
using TourismPlatform.API.Data;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Models;
using AutoMapper;

namespace TourismPlatform.API.Services
{
    public class BookingService : IBookingService
    {
        private readonly TourismDbContext _context;
        private readonly IMapper _mapper;

        public BookingService(TourismDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<BookingDto?> CreateBookingAsync(CreateBookingRequest request, string touristUserId)
        {
            try
            {
                var tour = await _context.Tours.FindAsync(request.TourId);
                if (tour == null) return null;

                var booking = _mapper.Map<Booking>(request);
                booking.Id = Guid.NewGuid().ToString("N");
                booking.TouristUserId = touristUserId;
                booking.TotalAmount = tour.Price * request.NumberOfPeople;
                booking.CreatedAt = DateTime.UtcNow;
                booking.UpdatedAt = DateTime.UtcNow;

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                return await GetBookingByIdAsync(booking.Id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<List<BookingDto>> GetBookingsByTouristAsync(string touristUserId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Tour)
                .ThenInclude(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .Include(b => b.TouristUser)
                .Where(b => b.TouristUserId == touristUserId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<BookingDto>>(bookings);
        }

        public async Task<List<BookingDto>> GetBookingsByAgencyAsync(string agencyUserId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Tour)
                .Include(b => b.TouristUser)
                .Where(b => b.Tour.AgencyUserId == agencyUserId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<BookingDto>>(bookings);
        }

        public async Task<BookingDto?> GetBookingByIdAsync(string bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Tour)
                .ThenInclude(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .Include(b => b.TouristUser)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            return booking != null ? _mapper.Map<BookingDto>(booking) : null;
        }

        public async Task<BookingDto?> UpdateBookingStatusAsync(string bookingId, UpdateBookingStatusRequest request, string agencyUserId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Tour)
                    .FirstOrDefaultAsync(b => b.Id == bookingId && b.Tour.AgencyUserId == agencyUserId);

                if (booking == null) return null;

                booking.Status = request.Status;
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return await GetBookingByIdAsync(bookingId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> CancelBookingAsync(string bookingId, string touristUserId)
        {
            try
            {
                var booking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.Id == bookingId && b.TouristUserId == touristUserId);

                if (booking == null) return false;

                booking.Status = "cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<BookingStatsDto> GetBookingStatsAsync(string agencyUserId)
        {
            try
            {
                // Get all bookings for tours owned by this agency
                var agencyBookings = await _context.Bookings
                    .Include(b => b.Tour)
                    .Where(b => b.Tour.AgencyUserId == agencyUserId)
                    .ToListAsync();

                var bookingStats = new
                {
                    TotalBookings = agencyBookings.Count(),
                    TotalRevenue = agencyBookings.Sum(b => b.TotalAmount),
                    ConfirmedBookings = agencyBookings.Count(b => b.Status == "confirmed"),
                    PendingBookings = agencyBookings.Count(b => b.Status == "pending")
                };

                // Handle average rating safely
                double averageRating = 0;
                var reviews = await _context.Reviews
                    .Include(r => r.Tour)
                    .Where(r => r.Tour.AgencyUserId == agencyUserId)
                    .ToListAsync();
                
                if (reviews.Any())
                {
                    averageRating = reviews.Average(r => (double)r.Rating);
                }

                var activeTours = await _context.Tours
                    .CountAsync(t => t.AgencyUserId == agencyUserId && t.IsActive);

                return new BookingStatsDto
                {
                    TotalBookings = bookingStats.TotalBookings,
                    TotalRevenue = bookingStats.TotalRevenue,
                    ConfirmedBookings = bookingStats.ConfirmedBookings,
                    PendingBookings = bookingStats.PendingBookings,
                    AverageRating = averageRating,
                    ActiveTours = activeTours
                };
            }
            catch (Exception ex)
            {
                // Log the error and return default stats
                Console.WriteLine($"Error getting booking stats: {ex.Message}");
                return new BookingStatsDto
                {
                    TotalBookings = 0,
                    TotalRevenue = 0,
                    ConfirmedBookings = 0,
                    PendingBookings = 0,
                    AverageRating = 0,
                    ActiveTours = 0
                };
            }
        }

        public async Task<List<BookingDto>> GetRecentBookingsByAgencyAsync(string agencyUserId, int limit = 10)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Tour)
                .Include(b => b.TouristUser)
                .Where(b => b.Tour.AgencyUserId == agencyUserId)
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return _mapper.Map<List<BookingDto>>(bookings);
        }
    }
}

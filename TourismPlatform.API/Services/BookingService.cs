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
            var bookingStats = await _context.Bookings
                .Include(b => b.Tour)
                .Where(b => b.Tour.AgencyUserId == agencyUserId)
                .GroupBy(b => 1)
                .Select(g => new
                {
                    TotalBookings = g.Count(),
                    TotalRevenue = g.Sum(b => b.TotalAmount),
                    ConfirmedBookings = g.Count(b => b.Status == "confirmed"),
                    PendingBookings = g.Count(b => b.Status == "pending")
                })
                .FirstOrDefaultAsync();

            var averageRating = await _context.Reviews
                .Include(r => r.Tour)
                .Where(r => r.Tour.AgencyUserId == agencyUserId)
                .AverageAsync(r => (double?)r.Rating) ?? 0;

            var activeTours = await _context.Tours
                .CountAsync(t => t.AgencyUserId == agencyUserId && t.IsActive);

            return new BookingStatsDto
            {
                TotalBookings = bookingStats?.TotalBookings ?? 0,
                TotalRevenue = bookingStats?.TotalRevenue ?? 0,
                ConfirmedBookings = bookingStats?.ConfirmedBookings ?? 0,
                PendingBookings = bookingStats?.PendingBookings ?? 0,
                AverageRating = averageRating,
                ActiveTours = activeTours
            };
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

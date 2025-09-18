using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Services;
using System.Security.Claims;

namespace TourismPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var booking = await _bookingService.CreateBookingAsync(request, userId);
            if (booking == null)
            {
                return BadRequest(new { message = "Failed to create booking" });
            }

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }

        [HttpGet]
        public async Task<ActionResult> GetBookings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            List<BookingDto> bookings;

            if (userType == "agency")
            {
                bookings = await _bookingService.GetBookingsByAgencyAsync(userId);
            }
            else
            {
                bookings = await _bookingService.GetBookingsByTouristAsync(userId);
            }

            return Ok(new { success = true, data = new { bookings = bookings } });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Check if user has access to this booking
            var userType = User.FindFirst("user_type")?.Value;
            if (userType == "agency" && booking.Tour?.AgencyUserId != userId)
            {
                return Forbid("You don't have permission to view this booking");
            }
            else if (userType == "tourist" && booking.TouristUserId != userId)
            {
                return Forbid("You don't have permission to view this booking");
            }

            return Ok(booking);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<BookingDto>> UpdateBookingStatus(string id, UpdateBookingStatusRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can update booking status");
            }

            var booking = await _bookingService.UpdateBookingStatusAsync(id, request, userId);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found or you don't have permission to update it" });
            }

            return Ok(booking);
        }

        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelBooking(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can cancel their bookings");
            }

            var success = await _bookingService.CancelBookingAsync(id, userId);
            if (!success)
            {
                return NotFound(new { message = "Booking not found or you don't have permission to cancel it" });
            }

            return NoContent();
        }

        [HttpGet("stats")]
        public async Task<ActionResult> GetBookingStats()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can view booking statistics");
            }

            var stats = await _bookingService.GetBookingStatsAsync(userId);
            return Ok(new { success = true, data = new { stats = stats } });
        }

        [HttpGet("recent")]
        public async Task<ActionResult> GetRecentBookings([FromQuery] int limit = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can view recent bookings");
            }

            var bookings = await _bookingService.GetRecentBookingsByAgencyAsync(userId, limit);
            return Ok(new { success = true, data = new { bookings = bookings } });
        }
    }
}

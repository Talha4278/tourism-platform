using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Services;
using System.Security.Claims;

namespace TourismPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly IReviewService _reviewService;

        public ToursController(ITourService tourService, IReviewService reviewService)
        {
            _tourService = tourService;
            _reviewService = reviewService;
        }

        [HttpGet]
        public async Task<ActionResult> GetTours([FromQuery] TourFilters? filters)
        {
            var response = await _tourService.GetToursAsync(filters);
            return Ok(new { success = true, data = new { tours = response.Tours, totalCount = response.TotalCount } });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetTour(string id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);
            if (tour == null)
            {
                return NotFound(new { message = "Tour not found" });
            }

            // Get reviews and rating for this tour
            var reviews = await _reviewService.GetReviewsByTourAsync(id);
            var rating = await _reviewService.GetTourRatingAsync(id);

            return Ok(new { success = true, data = new { tour = tour, reviews = reviews, rating = rating } });
        }

        [HttpGet("popular")]
        public async Task<ActionResult> GetPopularTours([FromQuery] int limit = 6)
        {
            var tours = await _tourService.GetPopularToursAsync(limit);
            return Ok(new { success = true, data = new { tours = tours } });
        }

        [HttpGet("destinations")]
        public async Task<ActionResult> GetDestinations()
        {
            var destinations = await _tourService.GetDestinationsAsync();
            return Ok(new { success = true, data = new { destinations = destinations } });
        }

        [HttpGet("agency")]
        [Authorize]
        public async Task<ActionResult> GetAgencyTours()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var tours = await _tourService.GetToursByAgencyAsync(userId);
            return Ok(new { success = true, data = new { tours = tours } });
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TourDto>> CreateTour(CreateTourRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can create tours");
            }

            var tour = await _tourService.CreateTourAsync(request, userId);
            if (tour == null)
            {
                return BadRequest(new { message = "Failed to create tour" });
            }

            return CreatedAtAction(nameof(GetTour), new { id = tour.Id }, tour);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<TourDto>> UpdateTour(string id, UpdateTourRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can update tours");
            }

            var tour = await _tourService.UpdateTourAsync(id, request, userId);
            if (tour == null)
            {
                return NotFound(new { message = "Tour not found or you don't have permission to update it" });
            }

            return Ok(tour);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteTour(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can delete tours");
            }

            var success = await _tourService.DeleteTourAsync(id, userId);
            if (!success)
            {
                return NotFound(new { message = "Tour not found or you don't have permission to delete it" });
            }

            return NoContent();
        }
    }
}

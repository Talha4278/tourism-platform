using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Services;
using System.Security.Claims;

namespace TourismPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can create reviews");
            }

            var review = await _reviewService.CreateReviewAsync(request, userId);
            if (review == null)
            {
                return BadRequest(new { message = "Failed to create review or you have already reviewed this tour" });
            }

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpGet("tour/{tourId}")]
        public async Task<ActionResult> GetReviewsByTour(string tourId)
        {
            var reviews = await _reviewService.GetReviewsByTourAsync(tourId);
            return Ok(new { success = true, data = new { reviews = reviews } });
        }

        [HttpGet("tour/{tourId}/rating")]
        public async Task<ActionResult<TourRatingDto>> GetTourRating(string tourId)
        {
            var rating = await _reviewService.GetTourRatingAsync(tourId);
            return Ok(rating);
        }

        [HttpGet("agency/{agencyUserId}/rating")]
        public async Task<ActionResult<AgencyRatingDto>> GetAgencyRating(string agencyUserId)
        {
            var rating = await _reviewService.GetAgencyRatingAsync(agencyUserId);
            return Ok(rating);
        }

        [HttpGet("my-reviews")]
        [Authorize]
        public async Task<ActionResult> GetMyReviews()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can view their reviews");
            }

            var reviews = await _reviewService.GetReviewsByTouristAsync(userId);
            return Ok(new { success = true, data = new { reviews = reviews } });
        }

        [HttpGet("tour/{tourId}/my-review")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> GetMyReviewForTour(string tourId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can view their reviews");
            }

            var review = await _reviewService.GetReviewByTouristAndTourAsync(userId, tourId);
            if (review == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            return Ok(review);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReview(string id)
        {
            // This would need to be implemented in the service
            return NotFound(new { message = "Get review by ID not implemented" });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> UpdateReview(string id, UpdateReviewRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can update their reviews");
            }

            var review = await _reviewService.UpdateReviewAsync(id, request, userId);
            if (review == null)
            {
                return NotFound(new { message = "Review not found or you don't have permission to update it" });
            }

            return Ok(review);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteReview(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "tourist")
            {
                return Forbid("Only tourists can delete their reviews");
            }

            var success = await _reviewService.DeleteReviewAsync(id, userId);
            if (!success)
            {
                return NotFound(new { message = "Review not found or you don't have permission to delete it" });
            }

            return NoContent();
        }

        [HttpGet("agency/recent")]
        [Authorize]
        public async Task<ActionResult> GetRecentReviewsForAgency([FromQuery] int limit = 10)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userType = User.FindFirst("user_type")?.Value;
            if (userType != "agency")
            {
                return Forbid("Only agencies can view recent reviews");
            }

            var reviews = await _reviewService.GetRecentReviewsByAgencyAsync(userId, limit);
            return Ok(new { success = true, data = new { reviews = reviews } });
        }
    }
}

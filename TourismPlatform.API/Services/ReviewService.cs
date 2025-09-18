using Microsoft.EntityFrameworkCore;
using TourismPlatform.API.Data;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Models;
using AutoMapper;

namespace TourismPlatform.API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly TourismDbContext _context;
        private readonly IMapper _mapper;

        public ReviewService(TourismDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ReviewDto?> CreateReviewAsync(CreateReviewRequest request, string touristUserId)
        {
            try
            {
                // Check if user already reviewed this tour
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.TourId == request.TourId && r.TouristUserId == touristUserId);

                if (existingReview != null)
                {
                    return null; // User already reviewed this tour
                }

                var review = _mapper.Map<Review>(request);
                review.Id = Guid.NewGuid().ToString("N");
                review.TouristUserId = touristUserId;
                review.CreatedAt = DateTime.UtcNow;
                review.UpdatedAt = DateTime.UtcNow;

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return await GetReviewByIdAsync(review.Id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<List<ReviewDto>> GetReviewsByTourAsync(string tourId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.TouristUser)
                .Where(r => r.TourId == tourId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<ReviewDto>>(reviews);
        }

        public async Task<List<ReviewDto>> GetReviewsByTouristAsync(string touristUserId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Tour)
                .Where(r => r.TouristUserId == touristUserId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<ReviewDto>>(reviews);
        }

        public async Task<ReviewDto?> GetReviewByTouristAndTourAsync(string touristUserId, string tourId)
        {
            var review = await _context.Reviews
                .Include(r => r.TouristUser)
                .FirstOrDefaultAsync(r => r.TouristUserId == touristUserId && r.TourId == tourId);

            return review != null ? _mapper.Map<ReviewDto>(review) : null;
        }

        public async Task<TourRatingDto> GetTourRatingAsync(string tourId)
        {
            var stats = await _context.Reviews
                .Where(r => r.TourId == tourId)
                .GroupBy(r => 1)
                .Select(g => new
                {
                    Count = g.Count(),
                    Average = g.Average(r => (double)r.Rating),
                    FiveStar = g.Count(r => r.Rating == 5),
                    FourStar = g.Count(r => r.Rating == 4),
                    ThreeStar = g.Count(r => r.Rating == 3),
                    TwoStar = g.Count(r => r.Rating == 2),
                    OneStar = g.Count(r => r.Rating == 1)
                })
                .FirstOrDefaultAsync();

            return new TourRatingDto
            {
                Count = stats?.Count ?? 0,
                Average = stats?.Average ?? 0,
                Distribution = new Dictionary<int, int>
                {
                    { 5, stats?.FiveStar ?? 0 },
                    { 4, stats?.FourStar ?? 0 },
                    { 3, stats?.ThreeStar ?? 0 },
                    { 2, stats?.TwoStar ?? 0 },
                    { 1, stats?.OneStar ?? 0 }
                }
            };
        }

        public async Task<AgencyRatingDto> GetAgencyRatingAsync(string agencyUserId)
        {
            var stats = await _context.Reviews
                .Include(r => r.Tour)
                .Where(r => r.Tour.AgencyUserId == agencyUserId)
                .GroupBy(r => 1)
                .Select(g => new
                {
                    Count = g.Count(),
                    Average = g.Average(r => (double)r.Rating)
                })
                .FirstOrDefaultAsync();

            return new AgencyRatingDto
            {
                Count = stats?.Count ?? 0,
                Average = stats?.Average ?? 0
            };
        }

        public async Task<ReviewDto?> UpdateReviewAsync(string reviewId, UpdateReviewRequest request, string touristUserId)
        {
            try
            {
                var review = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.TouristUserId == touristUserId);

                if (review == null) return null;

                _mapper.Map(request, review);
                review.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return await GetReviewByIdAsync(reviewId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> DeleteReviewAsync(string reviewId, string touristUserId)
        {
            try
            {
                var review = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.TouristUserId == touristUserId);

                if (review == null) return false;

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<ReviewDto>> GetRecentReviewsByAgencyAsync(string agencyUserId, int limit = 10)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Tour)
                .Include(r => r.TouristUser)
                .Where(r => r.Tour.AgencyUserId == agencyUserId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return _mapper.Map<List<ReviewDto>>(reviews);
        }

        private async Task<ReviewDto?> GetReviewByIdAsync(string reviewId)
        {
            var review = await _context.Reviews
                .Include(r => r.TouristUser)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            return review != null ? _mapper.Map<ReviewDto>(review) : null;
        }
    }
}

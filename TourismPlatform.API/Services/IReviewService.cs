using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Services
{
    public interface IReviewService
    {
        Task<ReviewDto?> CreateReviewAsync(CreateReviewRequest request, string touristUserId);
        Task<List<ReviewDto>> GetReviewsByTourAsync(string tourId);
        Task<List<ReviewDto>> GetReviewsByTouristAsync(string touristUserId);
        Task<ReviewDto?> GetReviewByTouristAndTourAsync(string touristUserId, string tourId);
        Task<TourRatingDto> GetTourRatingAsync(string tourId);
        Task<AgencyRatingDto> GetAgencyRatingAsync(string agencyUserId);
        Task<ReviewDto?> UpdateReviewAsync(string reviewId, UpdateReviewRequest request, string touristUserId);
        Task<bool> DeleteReviewAsync(string reviewId, string touristUserId);
        Task<List<ReviewDto>> GetRecentReviewsByAgencyAsync(string agencyUserId, int limit = 10);
    }
}

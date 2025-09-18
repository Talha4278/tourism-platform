using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Services
{
    public interface ITourService
    {
        Task<TourDto?> CreateTourAsync(CreateTourRequest request, string agencyUserId);
        Task<TourListResponse> GetToursAsync(TourFilters? filters = null);
        Task<TourDto?> GetTourByIdAsync(string tourId);
        Task<List<TourDto>> GetToursByAgencyAsync(string agencyUserId);
        Task<TourDto?> UpdateTourAsync(string tourId, UpdateTourRequest request, string agencyUserId);
        Task<bool> DeleteTourAsync(string tourId, string agencyUserId);
        Task<List<TourDto>> GetPopularToursAsync(int limit = 6);
        Task<List<string>> GetDestinationsAsync();
    }
}

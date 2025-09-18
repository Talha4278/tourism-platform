using Microsoft.EntityFrameworkCore;
using TourismPlatform.API.Data;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Models;
using AutoMapper;

namespace TourismPlatform.API.Services
{
    public class TourService : ITourService
    {
        private readonly TourismDbContext _context;
        private readonly IMapper _mapper;

        public TourService(TourismDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TourDto?> CreateTourAsync(CreateTourRequest request, string agencyUserId)
        {
            try
            {
                var tour = _mapper.Map<Tour>(request);
                tour.Id = Guid.NewGuid().ToString("N");
                tour.AgencyUserId = agencyUserId;
                tour.CreatedAt = DateTime.UtcNow;
                tour.UpdatedAt = DateTime.UtcNow;

                _context.Tours.Add(tour);
                await _context.SaveChangesAsync();

                return await GetTourByIdAsync(tour.Id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<TourListResponse> GetToursAsync(TourFilters? filters = null)
        {
            var query = _context.Tours
                .Include(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .Where(t => t.IsActive);

            // Apply filters
            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Destination))
                {
                    query = query.Where(t => t.Destination.Contains(filters.Destination));
                }

                if (filters.MaxPrice.HasValue)
                {
                    query = query.Where(t => t.Price <= filters.MaxPrice.Value);
                }

                if (!string.IsNullOrEmpty(filters.Category))
                {
                    query = query.Where(t => t.Category == filters.Category);
                }

                if (!string.IsNullOrEmpty(filters.Duration))
                {
                    switch (filters.Duration)
                    {
                        case "1":
                            query = query.Where(t => t.Duration == 1);
                            break;
                        case "2-3":
                            query = query.Where(t => t.Duration >= 2 && t.Duration <= 3);
                            break;
                        case "4-7":
                            query = query.Where(t => t.Duration >= 4 && t.Duration <= 7);
                            break;
                        case "7+":
                            query = query.Where(t => t.Duration >= 8);
                            break;
                    }
                }
            }

            var totalCount = await query.CountAsync();
            var tours = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var tourDtos = _mapper.Map<List<TourDto>>(tours);

            return new TourListResponse
            {
                Tours = tourDtos,
                TotalCount = totalCount
            };
        }

        public async Task<TourDto?> GetTourByIdAsync(string tourId)
        {
            var tour = await _context.Tours
                .Include(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .FirstOrDefaultAsync(t => t.Id == tourId);

            return tour != null ? _mapper.Map<TourDto>(tour) : null;
        }

        public async Task<List<TourDto>> GetToursByAgencyAsync(string agencyUserId)
        {
            var tours = await _context.Tours
                .Include(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .Where(t => t.AgencyUserId == agencyUserId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<TourDto>>(tours);
        }

        public async Task<TourDto?> UpdateTourAsync(string tourId, UpdateTourRequest request, string agencyUserId)
        {
            try
            {
                var tour = await _context.Tours
                    .FirstOrDefaultAsync(t => t.Id == tourId && t.AgencyUserId == agencyUserId);

                if (tour == null) return null;

                _mapper.Map(request, tour);
                tour.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return await GetTourByIdAsync(tourId);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> DeleteTourAsync(string tourId, string agencyUserId)
        {
            try
            {
                var tour = await _context.Tours
                    .FirstOrDefaultAsync(t => t.Id == tourId && t.AgencyUserId == agencyUserId);

                if (tour == null) return false;

                tour.IsActive = false;
                tour.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<TourDto>> GetPopularToursAsync(int limit = 6)
        {
            var tours = await _context.Tours
                .Include(t => t.AgencyUser)
                .ThenInclude(u => u.AgencyProfile)
                .Where(t => t.IsActive)
                .OrderByDescending(t => t.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return _mapper.Map<List<TourDto>>(tours);
        }

        public async Task<List<string>> GetDestinationsAsync()
        {
            return await _context.Tours
                .Where(t => t.IsActive)
                .Select(t => t.Destination)
                .Distinct()
                .OrderBy(d => d)
                .ToListAsync();
        }
    }
}

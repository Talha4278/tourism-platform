using AutoMapper;
using TourismPlatform.API.Models;
using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.AgencyProfile, opt => opt.MapFrom(src => src.AgencyProfile));
            
            CreateMap<AgencyProfile, AgencyProfileDto>();
            
            // Tour mappings
            CreateMap<Tour, TourDto>()
                .ForMember(dest => dest.AgencyUser, opt => opt.MapFrom(src => src.AgencyUser));
            
            CreateMap<CreateTourRequest, Tour>();
            CreateMap<UpdateTourRequest, Tour>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            
            // Booking mappings
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.Tour, opt => opt.MapFrom(src => src.Tour))
                .ForMember(dest => dest.TouristUser, opt => opt.MapFrom(src => src.TouristUser));
            
            CreateMap<CreateBookingRequest, Booking>();
            CreateMap<UpdateBookingStatusRequest, Booking>();
            
            // Review mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.TouristUser, opt => opt.MapFrom(src => src.TouristUser));
            
            CreateMap<CreateReviewRequest, Review>();
            CreateMap<UpdateReviewRequest, Review>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}

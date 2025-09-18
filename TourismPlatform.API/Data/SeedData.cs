using TourismPlatform.API.Models;
using TourismPlatform.API.Services;
using TourismPlatform.API.DTOs;

namespace TourismPlatform.API.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(TourismDbContext context, IAuthService authService)
        {
            // Check if data already exists
            if (context.Users.Any())
            {
                return; // Data already seeded
            }

            // Create sample users
            var agencyUser = new RegisterRequest
            {
                Name = "Adventure Tours Agency",
                Email = "agency@adventuretours.com",
                Password = "password123",
                Phone = "+1-555-0123",
                UserType = "agency",
                AgencyName = "Adventure Tours Agency",
                AgencyDescription = "We specialize in adventure tours and outdoor experiences around the world.",
                AgencyServices = "Hiking, Rock Climbing, Water Sports, Wildlife Tours"
            };

            var touristUser = new RegisterRequest
            {
                Name = "John Tourist",
                Email = "john@example.com",
                Password = "password123",
                Phone = "+1-555-0456",
                UserType = "tourist"
            };

            // Register users
            var agencyResult = await authService.RegisterAsync(agencyUser);
            var touristResult = await authService.RegisterAsync(touristUser);

            if (agencyResult.Success && touristResult.Success)
            {
                var agencyId = agencyResult.User!.Id;

                // Create sample tours
                var tours = new List<Tour>
                {
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Grand Canyon Hiking Adventure",
                        Description = "Experience the breathtaking beauty of the Grand Canyon with our expert guides. This 3-day hiking adventure takes you through some of the most scenic trails.",
                        Destination = "Grand Canyon, Arizona",
                        Category = "Adventure",
                        Duration = 3,
                        MaxGroupSize = 12,
                        Price = 450.00m,
                        ImageUrl = "https://images.pexels.com/photos/33041/antelope-canyon-lower-canyon-arizona.jpg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1: Arrival and orientation. Day 2: South Rim hiking. Day 3: Bright Angel Trail descent.",
                        Inclusions = "Professional guide, camping equipment, meals, transportation",
                        Exclusions = "Personal items, travel insurance",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Yosemite National Park Explorer",
                        Description = "Discover the natural wonders of Yosemite National Park. Perfect for nature lovers and photography enthusiasts.",
                        Destination = "Yosemite, California",
                        Category = "Nature",
                        Duration = 2,
                        MaxGroupSize = 15,
                        Price = 320.00m,
                        ImageUrl = "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1: Valley floor exploration. Day 2: Glacier Point and hiking trails.",
                        Inclusions = "Park entrance fees, guide, transportation, lunch",
                        Exclusions = "Accommodation, personal items",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Rocky Mountain Wildlife Safari",
                        Description = "Spot bears, elk, and other wildlife in their natural habitat. A perfect family adventure.",
                        Destination = "Rocky Mountains, Colorado",
                        Category = "Wildlife",
                        Duration = 4,
                        MaxGroupSize = 8,
                        Price = 580.00m,
                        ImageUrl = "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1-2: Wildlife spotting and photography. Day 3-4: Hiking and nature walks.",
                        Inclusions = "Expert wildlife guide, binoculars, meals, accommodation",
                        Exclusions = "Camera equipment, personal items",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Coastal California Road Trip",
                        Description = "Experience the stunning Pacific Coast Highway with stops at iconic beaches and coastal towns.",
                        Destination = "California Coast",
                        Category = "Sightseeing",
                        Duration = 5,
                        MaxGroupSize = 20,
                        Price = 750.00m,
                        ImageUrl = "https://images.pexels.com/photos/210205/pexels-photo-210205.jpeg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1: San Francisco to Monterey. Day 2-3: Big Sur exploration. Day 4-5: Santa Barbara and Malibu.",
                        Inclusions = "Vehicle rental, fuel, guide, accommodation",
                        Exclusions = "Meals, personal expenses",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Desert Hiking Experience",
                        Description = "Explore the unique beauty of desert landscapes with our experienced guides.",
                        Destination = "Joshua Tree, California",
                        Category = "Adventure",
                        Duration = 2,
                        MaxGroupSize = 10,
                        Price = 280.00m,
                        ImageUrl = "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1: Desert hiking and rock formations. Day 2: Stargazing and photography.",
                        Inclusions = "Guide, camping equipment, meals",
                        Exclusions = "Transportation, personal items",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Tour
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        Title = "Mountain Lake Retreat",
                        Description = "Relax and unwind at a beautiful mountain lake with fishing, kayaking, and hiking activities.",
                        Destination = "Lake Tahoe, California",
                        Category = "Relaxation",
                        Duration = 3,
                        MaxGroupSize = 16,
                        Price = 420.00m,
                        ImageUrl = "https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=600",
                        Itinerary = "Day 1: Lake activities and fishing. Day 2: Kayaking and hiking. Day 3: Relaxation and spa.",
                        Inclusions = "Accommodation, equipment rental, meals, spa access",
                        Exclusions = "Personal items, alcoholic beverages",
                        IsActive = true,
                        AgencyUserId = agencyId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                context.Tours.AddRange(tours);
                await context.SaveChangesAsync();
            }
        }
    }
}

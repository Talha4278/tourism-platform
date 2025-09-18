using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TourismPlatform.API.Data;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Models;
using AutoMapper;
using BCrypt.Net;

namespace TourismPlatform.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly TourismDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(TourismDbContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "User with this email already exists"
                    };
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = request.Name,
                    Email = request.Email,
                    Password = HashPassword(request.Password),
                    Phone = request.Phone,
                    UserType = request.UserType,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                // Create agency profile if user is an agency
                if (request.UserType == "agency" && !string.IsNullOrEmpty(request.AgencyName))
                {
                    var agencyProfile = new AgencyProfile
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        UserId = user.Id,
                        AgencyName = request.AgencyName,
                        Description = request.AgencyDescription,
                        Services = request.AgencyServices,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.AgencyProfiles.Add(agencyProfile);
                }

                await _context.SaveChangesAsync();

                // Get user with profile
                var userWithProfile = await _context.Users
                    .Include(u => u.AgencyProfile)
                    .FirstOrDefaultAsync(u => u.Id == user.Id);

                var userDto = _mapper.Map<UserDto>(userWithProfile);
                var token = GenerateJwtToken(userDto);

                return new AuthResponse
                {
                    Success = true,
                    Token = token,
                    User = userDto,
                    Message = "User registered successfully"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.AgencyProfile)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !await ValidatePasswordAsync(request.Password, user.Password))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }

                var userDto = _mapper.Map<UserDto>(user);
                var token = GenerateJwtToken(userDto);

                return new AuthResponse
                {
                    Success = true,
                    Token = token,
                    User = userDto,
                    Message = "Login successful"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = $"Login failed: {ex.Message}"
                };
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.AgencyProfile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user != null ? _mapper.Map<UserDto>(user) : null;
        }

        public async Task<UserDto?> UpdateProfileAsync(string userId, UpdateProfileRequest request)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.AgencyProfile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return null;

                // Update user basic info
                if (!string.IsNullOrEmpty(request.Name))
                    user.Name = request.Name;
                if (!string.IsNullOrEmpty(request.Phone))
                    user.Phone = request.Phone;

                user.UpdatedAt = DateTime.UtcNow;

                // Update agency profile if applicable
                if (user.UserType == "agency")
                {
                    if (user.AgencyProfile == null)
                    {
                        user.AgencyProfile = new AgencyProfile
                        {
                            Id = Guid.NewGuid().ToString("N"),
                            UserId = user.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.AgencyProfiles.Add(user.AgencyProfile);
                    }

                    if (!string.IsNullOrEmpty(request.AgencyName))
                        user.AgencyProfile.AgencyName = request.AgencyName;
                    if (!string.IsNullOrEmpty(request.AgencyDescription))
                        user.AgencyProfile.Description = request.AgencyDescription;
                    if (!string.IsNullOrEmpty(request.AgencyServices))
                        user.AgencyProfile.Services = request.AgencyServices;

                    user.AgencyProfile.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return _mapper.Map<UserDto>(user);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> ValidatePasswordAsync(string password, string hashedPassword)
        {
            return await Task.FromResult(BCrypt.Net.BCrypt.Verify(password, hashedPassword));
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, 12);
        }

        public string GenerateJwtToken(UserDto user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim("user_type", user.UserType)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

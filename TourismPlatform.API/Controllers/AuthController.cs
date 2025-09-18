using Microsoft.AspNetCore.Mvc;
using TourismPlatform.API.DTOs;
using TourismPlatform.API.Services;
using System.Security.Claims;

namespace TourismPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);
            
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(new { success = true, data = new { user = response.User, token = response.Token } });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            
            if (!response.Success)
            {
                return Unauthorized(response);
            }

            return Ok(new { success = true, data = new { user = response.User, token = response.Token } });
        }

        [HttpGet("profile")]
        public async Task<ActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { success = true, data = new { user = user } });
        }

        [HttpPut("profile")]
        public async Task<ActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = await _authService.UpdateProfileAsync(userId, request);
            if (user == null)
            {
                return BadRequest(new { message = "Failed to update profile" });
            }

            return Ok(new { success = true, data = new { user = user } });
        }
    }
}

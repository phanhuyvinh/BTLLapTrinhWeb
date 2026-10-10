using MedCare_Pharmacy.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedCare_Pharmacy.Controllers
{
    public class AccountController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IWebHostEnvironment _env;

        public AccountController(AppDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        [HttpGet]
        public IActionResult Profile() => View();

        public record ProfileDto(string Email, string FullName, string Phone, string? Address);

        [HttpPost("/api/account/profile")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Thiếu email" });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản" });

            user.FullName = dto.FullName?.Trim() ?? user.FullName;
            user.Phone = dto.Phone?.Trim() ?? user.Phone;
            user.Address = dto.Address?.Trim();
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã cập nhật hồ sơ",
                user = new
                {
                    user.Id,
                    name = user.FullName,
                    user.Email,
                    user.Phone,
                    user.Address,
                    user.AvatarUrl,
                    role = user.Role.ToLower()
                }
            });
        }

        [HttpPost("/api/account/avatar")]
        [IgnoreAntiforgeryToken]
        [RequestSizeLimit(2_000_000)]
        public async Task<IActionResult> UploadAvatar(string email, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Chưa chọn ảnh" });

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp"))
                return BadRequest(new { message = "Chỉ nhận jpg, png, webp" });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản" });

            var dir = Path.Combine(_env.WebRootPath, "uploads", "avatars");
            Directory.CreateDirectory(dir);
            var name = $"{user.Id}_{Guid.NewGuid():N}{ext}";
            var path = Path.Combine(dir, name);
            await using (var stream = System.IO.File.Create(path))
            {
                await file.CopyToAsync(stream);
            }

            user.AvatarUrl = $"/uploads/avatars/{name}";
            await _db.SaveChangesAsync();
            return Ok(new { avatarUrl = user.AvatarUrl });
        }
    }
}
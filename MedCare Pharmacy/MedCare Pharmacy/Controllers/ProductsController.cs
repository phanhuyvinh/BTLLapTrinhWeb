using MedCare_Pharmacy.Models.Data;
using MedCare_Pharmacy.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedCare_Pharmacy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products?q=...&cat=...&sort=...
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? q, [FromQuery] string? cat, [FromQuery] string? sort)
        {
            var query = _context.Products.Include(p => p.Category).AsQueryable();

            // Tìm kiếm từ khóa
            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(p => p.Name.Contains(q) || (p.ActiveIngredient != null && p.ActiveIngredient.Contains(q)));
            }

            // Lọc theo danh mục (Hỗ trợ cả ID số lẫn Tên chuỗi danh mục)
            if (!string.IsNullOrEmpty(cat))
            {
                if (int.TryParse(cat, out int catId))
                {
                    query = query.Where(p => p.CategoryId == catId);
                }
                else
                {
                    query = query.Where(p => p.Category != null && p.Category.Name == cat);
                }
            }

            // Sắp xếp
            if (sort == "low") query = query.OrderBy(p => p.Price);
            else if (sort == "high") query = query.OrderByDescending(p => p.Price);

            var products = await query.ToListAsync();
            return Ok(products);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });
            return Ok(product);
        }

        // POST: api/products
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            if (id != product.Id) return BadRequest();

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa sản phẩm thành công" });
        }
    }
}
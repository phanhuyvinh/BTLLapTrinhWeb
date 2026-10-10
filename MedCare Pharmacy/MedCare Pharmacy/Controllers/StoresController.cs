using MedCare_Pharmacy.Models.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedCare_Pharmacy.Controllers
{
    public class StoresController : Controller
    {
        private readonly AppDbContext _db;
        public StoresController(AppDbContext db) => _db = db;

        public async Task<IActionResult> Index()
        {
            var stores = await _db.PharmacyStores
                .Where(s => s.Status == "Active")
                .OrderBy(s => s.Name)
                .ToListAsync();
            return View(stores);
        }
    }
}
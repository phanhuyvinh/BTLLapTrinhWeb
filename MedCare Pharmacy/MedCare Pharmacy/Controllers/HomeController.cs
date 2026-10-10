using MedCare_Pharmacy.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace MedCare_Pharmacy.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }
        public IActionResult ShippingPolicy() => View();
        public IActionResult BuyingGuide() => View();
        public IActionResult ReturnPolicy() => View();
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

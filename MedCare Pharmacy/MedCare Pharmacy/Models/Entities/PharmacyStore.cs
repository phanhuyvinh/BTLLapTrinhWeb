namespace MedCare_Pharmacy.Models.Entities
{
    public class PharmacyStore
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? OpeningHours { get; set; }
        public string Status { get; set; } = "Active";
    }
}
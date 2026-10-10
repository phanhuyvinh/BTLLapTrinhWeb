namespace MedCare_Pharmacy.Models.Entities
{
    public class InventoryBatch
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        public string LotNumber { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime MfgDate { get; set; }
        public DateTime ExpDate { get; set; }
        public decimal ImportPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
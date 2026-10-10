using MedCare_Pharmacy.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedCare_Pharmacy.Models.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<InventoryBatch> InventoryBatches { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<PharmacyStore> PharmacyStores { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>().ToTable("Category");
            modelBuilder.Entity<ChatMessage>().ToTable("ChatMessage");
            modelBuilder.Entity<InventoryBatch>().ToTable("InventoryBatch");
            modelBuilder.Entity<Order>().ToTable("Order");
            modelBuilder.Entity<OrderDetail>().ToTable("OrderDetail");
            modelBuilder.Entity<Product>().ToTable("Product");
            modelBuilder.Entity<Supplier>().ToTable("Supplier");
            modelBuilder.Entity<User>().ToTable("User");
            modelBuilder.Entity<PharmacyStore>().ToTable("PharmacyStore");
            modelBuilder.Entity<PharmacyStore>().Property(s => s.Latitude).HasPrecision(9, 6);
            modelBuilder.Entity<PharmacyStore>().Property(s => s.Longitude).HasPrecision(9, 6);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Cấu hình rõ ràng mối quan hệ Order - OrderDetail
            modelBuilder.Entity<Order>()
                .HasMany(o => o.OrderDetails)
                .WithOne(d => d.Order)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderDetail>()
                .Property(d => d.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<InventoryBatch>()
                .Property(b => b.ImportPrice)
                .HasPrecision(18, 2);
        }
    }
}
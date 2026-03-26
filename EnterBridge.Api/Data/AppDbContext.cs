using EnterBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EnterBridge.Api.Data
{
    /// <summary>
    /// Application EF Core DbContext for orders and order lines.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        /// <summary>
        /// Orders table.
        /// </summary>
        public DbSet<Order> Orders => Set<Order>();

        /// <summary>
        /// Order lines table.
        /// </summary>
        public DbSet<OrderLine> OrderLines => Set<OrderLine>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");

                entity.HasKey(o => o.Id);

                entity.Property(o => o.CreatedAt)
                      .IsRequired();

                entity.Property(o => o.CreatedBy)
                      .IsRequired()
                      .HasMaxLength(100);

                // One-to-many: Order has many OrderLines
                entity.HasMany(o => o.Lines)
                      .WithOne(ol => ol.Order!)
                      .HasForeignKey(ol => ol.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderLine configuration
            modelBuilder.Entity<OrderLine>(entity =>
            {
                entity.ToTable("OrderLines");

                entity.HasKey(ol => ol.Id);

                entity.Property(ol => ol.ProductName)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(ol => ol.UnitOfMeasure)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(ol => ol.UnitPrice)
                      .HasColumnType("decimal(18,2)");

                entity.Property(ol => ol.PriceEffectiveDate)
                      .IsRequired();

                // Simple index to speed up queries by OrderId
                entity.HasIndex(ol => ol.OrderId);
            });
        }
    }
}

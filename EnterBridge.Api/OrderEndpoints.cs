using System.Linq;
using EnterBridge.Api.Data;
using EnterBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EnterBridge.Api
{
    /// <summary>
    /// Local order routes backed by this application's own database.
    ///
    /// Design choice:
    /// - Product and price catalog data remains in the external API.
    /// - Order workflow/state is owned locally in SQLite via EF Core.
    /// - Orders store a price snapshot (`UnitPrice` and `PriceEffectiveDate`) at creation time
    ///   so later market price changes do not alter historical orders.
    /// </summary>
    public static class OrderEndpoints
    {
        public static void MapOrderEndpoints(this WebApplication app)
        {
        // Returns all locally stored orders with their line items.
        app.MapGet("/api/orders", async (AppDbContext db) =>
        {
            var orders = await db.Orders.Include(o => o.Lines).ToListAsync();
            return Results.Ok(orders);
        });

        // Returns one locally stored order by id, including line items.
        app.MapGet("/api/orders/{id}", async (int id, AppDbContext db) =>
        {
            var order = await db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id);
            return order is null ? Results.NotFound() : Results.Ok(order);
        });

        // Creates a new local order from client-provided line snapshots.
        // This endpoint intentionally persists pricing details into local storage
        // so order history is stable even when external prices change later.
        app.MapPost("/api/orders", async (CreateOrderRequest request, AppDbContext db) =>
        {
            var lines = request.Lines.Select(l => new OrderLine
            {
                ProductId = l.ProductId,
                ProductName = l.ProductName,
                Quantity = l.Quantity,
                UnitOfMeasure = l.UnitOfMeasure,
                UnitPrice = l.UnitPrice,
                PriceEffectiveDate = l.PriceEffectiveDate
            }).ToList();

            var order = new Order
            {
                CreatedBy = request.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                Lines = lines
            };

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return Results.Created($"/api/orders/{order.Id}", order);
        });
        }
    }
}
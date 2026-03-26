using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EnterBridge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EnterBridge.Api.Data
{
    /// <summary>
    /// Simple database seeder that inserts a demo order when DB is empty.
    /// </summary>
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext dbContext)
        {
            // Ensure the database is created (no migrations needed).
            dbContext.Database.EnsureCreated();

            // Only seed if there are no orders.
            if (await dbContext.Orders.AnyAsync())
            {
                return;
            }

            var now = DateTime.UtcNow;

            var orders = new List<Order>
            {
                new Order
                {
                    CreatedAt = now.AddDays(-42), // 6 weeks ago (oldest)
                    CreatedBy = "Ashley Taylor",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 4004,
                            ProductName = "Roofing Shingles - Asphalt, 100 sq ft",
                            Quantity = 2,
                            UnitOfMeasure = "Bundle",
                            UnitPrice = 89.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 20)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-35), // 5 weeks ago
                    CreatedBy = "David Moore",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 3003,
                            ProductName = "Drywall Screws 1.25in, 1000 pack",
                            Quantity = 3,
                            UnitOfMeasure = "Pack",
                            UnitPrice = 12.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 10)
                        },
                        new OrderLine
                        {
                            ProductId = 6006,
                            ProductName = "Electrical Wire 12ga 100ft",
                            Quantity = 2,
                            UnitOfMeasure = "Spool",
                            UnitPrice = 29.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 5)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-28), // 4 weeks ago
                    CreatedBy = "Sarah Miller",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 5005,
                            ProductName = "Concrete Mix 80lb Bag",
                            Quantity = 4,
                            UnitOfMeasure = "Bag",
                            UnitPrice = 7.49m,
                            PriceEffectiveDate = new DateTime(2023, 8, 1)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-21), // 3 weeks ago
                    CreatedBy = "John Smith",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 1001,
                            ProductName = "2x4 Lumber 8ft",
                            Quantity = 10,
                            UnitOfMeasure = "Each",
                            UnitPrice = 5.99m,
                            PriceEffectiveDate = new DateTime(2023, 6, 15)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-18),
                    CreatedBy = "Lauren White",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 6006,
                            ProductName = "Electrical Wire 12ga 100ft",
                            Quantity = 4,
                            UnitOfMeasure = "Spool",
                            UnitPrice = 29.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 5)
                        },
                        new OrderLine
                        {
                            ProductId = 7007,
                            ProductName = "PVC Pipe 2in x 10ft",
                            Quantity = 8,
                            UnitOfMeasure = "Length",
                            UnitPrice = 4.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 10)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-14), // 2 weeks ago
                    CreatedBy = "Jane Johnson",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 2002,
                            ProductName = "Interior Wall Paint - White, 1 Gallon",
                            Quantity = 3,
                            UnitOfMeasure = "Gallon",
                            UnitPrice = 24.50m,
                            PriceEffectiveDate = new DateTime(2023, 7, 1)
                        },
                        new OrderLine
                        {
                            ProductId = 3003,
                            ProductName = "Drywall Screws 1.25in, 1000 pack",
                            Quantity = 2,
                            UnitOfMeasure = "Pack",
                            UnitPrice = 12.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 10)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-12),
                    CreatedBy = "Matthew Harris",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 5005,
                            ProductName = "Concrete Mix 80lb Bag",
                            Quantity = 10,
                            UnitOfMeasure = "Bag",
                            UnitPrice = 7.49m,
                            PriceEffectiveDate = new DateTime(2023, 8, 1)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-10), // About 1.5 weeks ago
                    CreatedBy = "Michael Brown",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 1001,
                            ProductName = "2x4 Lumber 8ft",
                            Quantity = 5,
                            UnitOfMeasure = "Each",
                            UnitPrice = 5.99m,
                            PriceEffectiveDate = new DateTime(2023, 6, 15)
                        },
                        new OrderLine
                        {
                            ProductId = 4004,
                            ProductName = "Roofing Shingles - Asphalt, 100 sq ft",
                            Quantity = 1,
                            UnitOfMeasure = "Bundle",
                            UnitPrice = 89.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 20)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-9),
                    CreatedBy = "Brittany Martin",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 4004,
                            ProductName = "Roofing Shingles - Asphalt, 100 sq ft",
                            Quantity = 3,
                            UnitOfMeasure = "Bundle",
                            UnitPrice = 89.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 20)
                        },
                        new OrderLine
                        {
                            ProductId = 3003,
                            ProductName = "Drywall Screws 1.25in, 1000 pack",
                            Quantity = 1,
                            UnitOfMeasure = "Pack",
                            UnitPrice = 12.99m,
                            PriceEffectiveDate = new DateTime(2023, 7, 10)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-7), // 1 week ago
                    CreatedBy = "Emily Davis",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 2002,
                            ProductName = "Interior Wall Paint - White, 1 Gallon",
                            Quantity = 5,
                            UnitOfMeasure = "Gallon",
                            UnitPrice = 24.50m,
                            PriceEffectiveDate = new DateTime(2023, 7, 1)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-5), // 5 days ago
                    CreatedBy = "Christopher Anderson",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 1001,
                            ProductName = "2x4 Lumber 8ft",
                            Quantity = 15,
                            UnitOfMeasure = "Each",
                            UnitPrice = 5.99m,
                            PriceEffectiveDate = new DateTime(2023, 6, 15)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-3), // 3 days ago
                    CreatedBy = "Megan Thomas",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 7007,
                            ProductName = "PVC Pipe 2in x 10ft",
                            Quantity = 6,
                            UnitOfMeasure = "Length",
                            UnitPrice = 4.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 10)
                        },
                        new OrderLine
                        {
                            ProductId = 2002,
                            ProductName = "Interior Wall Paint - White, 1 Gallon",
                            Quantity = 4,
                            UnitOfMeasure = "Gallon",
                            UnitPrice = 24.50m,
                            PriceEffectiveDate = new DateTime(2023, 7, 1)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-2),
                    CreatedBy = "Joshua Thompson",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 9009,
                            ProductName = "Flooring Laminate 10sq ft",
                            Quantity = 7,
                            UnitOfMeasure = "Box",
                            UnitPrice = 34.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 20)
                        },
                        new OrderLine
                        {
                            ProductId = 8008,
                            ProductName = "Tile Adhesive 5gal",
                            Quantity = 3,
                            UnitOfMeasure = "Pail",
                            UnitPrice = 19.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 15)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddDays(-1), // Yesterday
                    CreatedBy = "Daniel Jackson",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 8008,
                            ProductName = "Tile Adhesive 5gal",
                            Quantity = 2,
                            UnitOfMeasure = "Pail",
                            UnitPrice = 19.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 15)
                        },
                        new OrderLine
                        {
                            ProductId = 9009,
                            ProductName = "Flooring Laminate 10sq ft",
                            Quantity = 5,
                            UnitOfMeasure = "Box",
                            UnitPrice = 34.99m,
                            PriceEffectiveDate = new DateTime(2023, 8, 20)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now.AddHours(-6),
                    CreatedBy = "Nicole Garcia",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 1001,
                            ProductName = "2x4 Lumber 8ft",
                            Quantity = 20,
                            UnitOfMeasure = "Each",
                            UnitPrice = 5.99m,
                            PriceEffectiveDate = new DateTime(2023, 6, 15)
                        },
                        new OrderLine
                        {
                            ProductId = 5005,
                            ProductName = "Concrete Mix 80lb Bag",
                            Quantity = 6,
                            UnitOfMeasure = "Bag",
                            UnitPrice = 7.49m,
                            PriceEffectiveDate = new DateTime(2023, 8, 1)
                        }
                    }
                },
                new Order
                {
                    CreatedAt = now, // Today (newest)
                    CreatedBy = "Robert Wilson",
                    Lines =
                    {
                        new OrderLine
                        {
                            ProductId = 1001,
                            ProductName = "2x4 Lumber 8ft",
                            Quantity = 10,
                            UnitOfMeasure = "Each",
                            UnitPrice = 5.99m,
                            PriceEffectiveDate = new DateTime(2023, 6, 15)
                        },
                        new OrderLine
                        {
                            ProductId = 2002,
                            ProductName = "Interior Wall Paint - White, 1 Gallon",
                            Quantity = 3,
                            UnitOfMeasure = "Gallon",
                            UnitPrice = 24.50m,
                            PriceEffectiveDate = new DateTime(2023, 7, 1)
                        }
                    }
                }
            };

            await dbContext.Orders.AddRangeAsync(orders);
            await dbContext.SaveChangesAsync();
        }
    }
}

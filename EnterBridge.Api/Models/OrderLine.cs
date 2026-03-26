using System;

namespace EnterBridge.Api.Models
{
    /// <summary>
    /// Line item belonging to an order.
    /// </summary>
    public class OrderLine
    {
        /// <summary>
        /// Primary key for the order line.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Foreign key to the parent order.
        /// </summary>
        public int OrderId { get; set; }

        /// <summary>
        /// Product ID from the external pricing API.
        /// </summary>
        public int ProductId { get; set; }

        /// <summary>
        /// Product name snapshot at the time of ordering.
        /// </summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Quantity ordered.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Unit of measure (e.g. Each, LinearFeet, Gallon).
        /// </summary>
        public string UnitOfMeasure { get; set; } = string.Empty;

        /// <summary>
        /// Unit price for the product at the time of ordering.
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// The date the price was effective.
        /// </summary>
        public DateTime PriceEffectiveDate { get; set; }

        /// <summary>
        /// Navigation to the parent order.
        /// </summary>
        public Order? Order { get; set; }
    }
}

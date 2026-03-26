using System;
using System.Collections.Generic;

namespace EnterBridge.Api.Models
{
    /// <summary>
    /// Order header entity. Represents a single customer order.
    /// </summary>
    public class Order
    {
        /// <summary>
        /// Primary key for the order.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// UTC timestamp when the order was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Identifier of the user or system that created the order.
        /// </summary>
        public string CreatedBy { get; set; } = string.Empty;

        /// <summary>
        /// Navigation property to the order line items.
        /// </summary>
        public ICollection<OrderLine> Lines { get; set; } = new List<OrderLine>();
    }
}

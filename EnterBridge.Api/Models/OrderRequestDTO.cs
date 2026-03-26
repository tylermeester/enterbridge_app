namespace EnterBridge.Api.Models
{
    /// <summary>
    /// Request payload for one order line when creating a new order.
    /// Stores a snapshot of product and pricing details at order time.
    /// </summary>
    /// <param name="ProductId">External product identifier.</param>
    /// <param name="ProductName">Product name snapshot at the time of order creation.</param>
    /// <param name="Quantity">Requested quantity.</param>
    /// <param name="UnitOfMeasure">Unit of measure used for the quantity (e.g., Each, Gallon).</param>
    /// <param name="UnitPrice">Unit price snapshot captured at order time.</param>
    /// <param name="PriceEffectiveDate">Date the selected price became effective.</param>
    public record CreateOrderLineRequest(
        int ProductId,
        string ProductName,
        decimal Quantity,
        string UnitOfMeasure,
        decimal UnitPrice,
        DateTime PriceEffectiveDate);

    /// <summary>
    /// Request payload for creating a new order with one or more line items.
    /// </summary>
    /// <param name="CreatedBy">Name or identifier for the user creating the order.</param>
    /// <param name="Lines">Line items to include in the new order.</param>
    public record CreateOrderRequest(
        string CreatedBy,
        List<CreateOrderLineRequest> Lines);
}
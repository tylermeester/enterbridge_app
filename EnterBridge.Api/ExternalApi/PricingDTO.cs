using System.Text.Json.Serialization;

namespace EnterBridge.Api.ExternalApi.Dtos
{
    /// <summary>
    /// DTO representing a product from the external EnterBridge pricing API.
    /// Derived from the ProductDto definition in the API's Swagger spec.
    /// </summary>
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO representing a price record from the external EnterBridge pricing API.
    /// Derived from the PriceDto definition in the API's Swagger spec.
    /// </summary>
    public class PriceDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime DateTime { get; set; }
        public double Quantity { get; set; }
        public string UnitOfMeasure { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public ProductDto? Product { get; set; }
    }

    /// <summary>
    /// Paginated response for price queries from the external EnterBridge pricing API.
    /// Derived from the PriceDtoPaginatedResponse definition in the API's Swagger spec.
    /// </summary>
    public class PaginatedPriceDtoResponse
    {
        /// <summary>
        /// The current page number (1-based).
        /// </summary>
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
        public List<PriceDto> Items { get; set; } = new();
    }

    /// <summary>
    /// Enum for product categories from the external EnterBridge pricing API.
    /// Derived from the Category definition in the API's Swagger spec.
    /// </summary>
    public enum Category
    {
        Lumber,
        Plumbing,
        Electrical,
        Tools,
        Paint,
        Hardware,
        Garden,
        Concrete,
        Insulation,
        Other
    }

    /// <summary>
    /// Enum for units of measure from the external EnterBridge pricing API.
    /// Derived from the UnitOfMeasure definition in the API's Swagger spec.
    /// </summary>
    public enum UnitOfMeasure
    {
        Each,
        LinearFeet,
        SquareFeet,
        CubicFeet,
        BoardFeet,
        Pound,
        Ounce,
        Gallon,
        Quart,
        Pint,
        FluidOunce,
        SquareYard,
        CubicYard,
        Roll,
        Box,
        Bundle,
        Case,
        Pallet,
        Ton,
        Kilogram,
        Gram,
        Liter,
        Milliliter,
        Meter,
        Centimeter,
        Millimeter,
        SquareMeter,
        CubicMeter
    }
}
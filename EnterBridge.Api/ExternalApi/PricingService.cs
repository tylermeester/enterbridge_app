using EnterBridge.Api.ExternalApi.Dtos;
using System.Text.Json;

namespace EnterBridge.Api.ExternalApi.Services
{
    /// <summary>
    /// Contract for reading product and pricing data from the external EnterBridge API.
    ///
    /// Note: this service does not persist catalog/price data locally; it acts as an
    /// integration layer that fetches and shapes external data for this application.
    /// </summary>
    public interface IPricingService
    {
        /// <summary>
        /// Retrieves one product by id from the external API.
        /// </summary>
        Task<ProductDto?> GetProductAsync(int productId);

        /// <summary>
        /// Retrieves full price history for a product in the provided date range.
        /// Internally follows external pagination and aggregates all pages.
        /// </summary>
        Task<PaginatedPriceDtoResponse?> GetPriceHistoryAsync(int productId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Retrieves a paginated product list from the external API as raw JSON.
        /// This keeps the endpoint as a thin proxy for fast iteration.
        /// </summary>
        Task<string?> GetProductsAsync(string? category, string? sortBy, int? pageNumber, int? pageSize);
    }

    /// <summary>
    /// Integration service responsible for external product and pricing calls.
    ///
    /// Design choice:
    /// - External API remains source of truth for catalog and market price history.
    /// - Local database remains source of truth for app-owned order workflow data.
    /// - This service centralizes external URL building, HTTP calls, deserialization,
    ///   and price-history pagination logic so endpoints/controllers stay simple.
    /// </summary>
    public class PricingService : IPricingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PricingService> _logger;

        private const string BaseUrl = "https://api.casestudy.enterbridge.com";

        // Make JSON deserialization tolerant to property name casing from the external API
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public PricingService(HttpClient httpClient, IConfiguration configuration, ILogger<PricingService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Proxies product-list queries to the external API.
        /// Returns raw JSON so the endpoint can pass through external paging metadata.
        /// </summary>
        public async Task<string?> GetProductsAsync(string? category, string? sortBy, int? pageNumber, int? pageSize)
        {
            try
            {
                var query = new List<string>();
                if (!string.IsNullOrEmpty(category)) query.Add($"category={Uri.EscapeDataString(category)}");
                if (!string.IsNullOrEmpty(sortBy)) query.Add($"sortBy={Uri.EscapeDataString(sortBy)}");
                if (pageNumber.HasValue) query.Add($"pageNumber={pageNumber.Value}");
                if (pageSize.HasValue) query.Add($"pageSize={pageSize.Value}");

                var url = BaseUrl + "/api/products" + (query.Count > 0 ? "?" + string.Join("&", query) : string.Empty);
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                return await response.Content.ReadAsStringAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching products list: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Fetches a single product record from the external API and deserializes it
        /// into <see cref="ProductDto"/>.
        /// </summary>
        public async Task<ProductDto?> GetProductAsync(int productId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{BaseUrl}/api/products/{productId}");
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<ProductDto>(json, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching product {productId}: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Fetches and aggregates all external price pages for the requested range.
        /// Returns a single in-memory response object containing all items.
        /// </summary>
        public async Task<PaginatedPriceDtoResponse?> GetPriceHistoryAsync(int productId, DateTime startDate, DateTime endDate)
        {
            try
            {
                // Use max external page size to minimize round trips.
                const int pageSize = 1000;

                var firstPage = await GetPriceHistoryPageAsync(productId, startDate, endDate, pageNumber: 1, pageSize);
                if (firstPage is null)
                {
                    return null;
                }

                var allItems = new List<PriceDto>(firstPage.Items);
                var currentPage = firstPage;

                // Continue until external API indicates no additional pages.
                while (currentPage.HasNextPage)
                {
                    var nextPageNumber = currentPage.PageNumber + 1;
                    var nextPage = await GetPriceHistoryPageAsync(productId, startDate, endDate, nextPageNumber, pageSize);
                    if (nextPage is null)
                    {
                        return null;
                    }

                    allItems.AddRange(nextPage.Items);
                    currentPage = nextPage;
                }

                return new PaginatedPriceDtoResponse
                {
                    PageNumber = 1,
                    PageSize = allItems.Count,
                    TotalCount = allItems.Count,
                    TotalPages = 1,
                    HasPreviousPage = false,
                    HasNextPage = false,
                    Items = allItems
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching price history: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Fetches one external prices page for a given product and date range.
        /// </summary>
        private async Task<PaginatedPriceDtoResponse?> GetPriceHistoryPageAsync(
            int productId,
            DateTime startDate,
            DateTime endDate,
            int pageNumber,
            int pageSize)
        {
            var query = $"{BaseUrl}/api/prices?productId={productId}&startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}&PageNumber={pageNumber}&PageSize={pageSize}&sortBy=DateTime&sortDirection=asc";
            var response = await _httpClient.GetAsync(query);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<PaginatedPriceDtoResponse>(json, _jsonOptions);
        }
    }
}
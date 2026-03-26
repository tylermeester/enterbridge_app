using EnterBridge.Api.ExternalApi.Services;

namespace EnterBridge.Api
{
    /// <summary>
    /// External-facing routes used by the frontend for product and pricing data.
    ///
    /// - Keep the external pricing API as the source of truth for catalog/price history.
    /// - Keep local storage focused on app-owned data (orders/workflow).
    /// - Route frontend calls through this API so the UI depends on one backend contract.
    ///
    /// Request flow:
    /// Frontend -> these endpoints -> IPricingService -> external EnterBridge API -> response back to frontend.
    /// </summary>
    public static class ExternalApiEndpoints
    {
        public static void MapExternalApiEndpoints(this WebApplication app)
        {
        // Product list proxy endpoint.
        // Accepts UI-friendly query params and forwards them to the pricing service,
        // which performs the actual external API call.
        app.MapGet("/api/products", async (HttpRequest req, IPricingService pricingService) =>
        {
            var category = req.Query["category"].ToString();
            var sortBy = req.Query["sortBy"].ToString();

            int? pageNumber = null;
            if (int.TryParse(req.Query["pageNumber"], out var pn) && pn > 0) pageNumber = pn;

            int? pageSize = null;
            if (int.TryParse(req.Query["pageSize"], out var ps) && ps > 0) pageSize = ps;

            var json = await pricingService.GetProductsAsync(string.IsNullOrEmpty(category) ? null : category,
                                                            string.IsNullOrEmpty(sortBy) ? null : sortBy,
                                                            pageNumber,
                                                            pageSize);

            return json is null ? Results.StatusCode(502) : Results.Content(json, "application/json");
        });

        // Single product lookup proxy.
        // Returns typed DTO data from the external API via the pricing service.
        app.MapGet("/api/products/{id}", async (int id, IPricingService pricingService) =>
        {
            var product = await pricingService.GetProductAsync(id);
            return product is null ? Results.NotFound() : Results.Ok(product);
        });

        // Price history endpoint for the app.
        // Provides a simple app route while the pricing service handles external pagination
        // and aggregation across pages.
        app.MapGet("/api/prices/history/{productId}", async (int productId, HttpRequest req, IPricingService pricingService) =>
        {
            var end = DateTime.UtcNow;
            if (DateTime.TryParse(req.Query["endDate"], out var parsedEnd))
            {
                end = parsedEnd;
            }

            var start = end.AddMonths(-6);
            if (DateTime.TryParse(req.Query["startDate"], out var parsedStart))
            {
                start = parsedStart;
            }

            if (start > end)
            {
                return Results.BadRequest("startDate must be earlier than or equal to endDate.");
            }

            var history = await pricingService.GetPriceHistoryAsync(productId, start, end);
            return history is null ? Results.NotFound() : Results.Ok(history);
        });
        }
    }
}
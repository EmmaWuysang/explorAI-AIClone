export interface AnalyzedProduct {
    id: string;
    name: string;
    stock: number;
    incomingStock: number;
    price: number;
    // Calculated Metrics
    averageDailyUsage: number;
    standardDeviation: number;
    leadTimeDays: number;
    safetyStock: number;
    reorderPoint: number;
    eoq: number;
    stockoutRisk: number; // 0-100%
    daysCover: number;
    // Simulation Data
    salesHistory: { date: string; value: number }[];
    forecast: { date: string; value: number }[];
    status: 'OPTIMAL' | 'REORDER' | 'CRITICAL' | 'OVERSTOCK';
    recommendation: string;
}

// Pseudo-random number generator for deterministic results based on seed
function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    }
}

// Generate a deterministic seed from a string
function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

export function analyzeProduct(product: any): AnalyzedProduct {
    // Initialize RNG for this product
    const seed = cyrb128(product.id);
    const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

    // Simulation Parameters
    // Local pharmacy scale: Very low volume
    const baseDemand = 0.2 + (rand() * 3); // Daily demand between 0.2 - 3.2 units
    const seasonality = rand() > 0.5; // 50% chance of seasonality
    const volatility = 0.3 + (rand() * 0.7); // High variance for low volume items
    const leadTime = 1 + Math.floor(rand() * 3); // 1-3 days

    // Holding cost: typically 20-30% of item value annually
    // Scale up price assumption to drive higher holding cost -> lower EOQ
    const unitPrice = product.price || 50;
    // Assume high storage cost/opportunity cost (40% annually)
    const holdingCost = (unitPrice * 0.40) / 365;

    // Very low order cost (e.g. quick phone call/web portal)
    const orderCost = 2 + (rand() * 8); // $2-$10 per order

    // Generate 90 days of history
    const history = [];
    const forecast = [];
    const values: number[] = [];
    const now = new Date();

    // 1. Generate History
    for (let i = 89; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Base sine wave for seasonality
        const seasonFactor = seasonality ? Math.sin(i / 15) * 0.4 : 0;
        const noise = (rand() - 0.5) * 2 * volatility;

        // Ensure non-negative, integer demand
        let demand = Math.round(baseDemand * (1 + seasonFactor + noise));
        demand = Math.max(0, demand);

        history.push({
            date: date.toISOString().split('T')[0],
            value: demand
        });
        values.push(demand);
    }

    // 2. Generate Forecast (next 14 days)
    for (let i = 1; i <= 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);

        // Simple smoothing for forecast
        const seasonFactor = seasonality ? Math.sin(i / 15) * 0.3 : 0;
        const demand = Math.round(baseDemand * (1 + seasonFactor)); // Less noise in forecast

        forecast.push({
            date: date.toISOString().split('T')[0],
            value: demand
        });
    }

    // 3. Calculate Metrics
    const sum = values.reduce((a, b) => a + b, 0);
    const avgUsage = sum / values.length;

    // Std. Deviation
    const squareDiffs = values.map(v => Math.pow(v - avgUsage, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    // Safety Stock (Z-score 1.65 for 95% service level)
    const safetyStock = Math.ceil(1.65 * stdDev * Math.sqrt(leadTime));

    // Reorder Point
    const reorderPoint = Math.ceil((avgUsage * leadTime) + safetyStock);

    // EOQ: Sqrt(2 * AnnualDemand * OrderCost / HoldingCost)
    // Annualized Demand = avgUsage * 365
    const eoq = Math.round(Math.sqrt((2 * (avgUsage * 365) * orderCost) / holdingCost));

    // Days Cover
    const stock = product.quantity;
    const daysCover = avgUsage > 0 ? parseFloat((stock / avgUsage).toFixed(1)) : 999;

    // Status Determination
    let status: AnalyzedProduct['status'] = 'OPTIMAL';
    let recommendation = "Stock levels healthy.";
    let stockoutRisk = 5; // Default low risk

    if (stock <= 0) {
        status = 'CRITICAL';
        recommendation = "IMMEDIATE REORDER REQUIRED. Stockout active.";
        stockoutRisk = 100;
    } else if (stock <= reorderPoint) {
        status = 'REORDER';
        recommendation = `Reorder Point (${reorderPoint}) breached. Order ${eoq} units.`;
        // Simple risk calc: closer to 0, higher risk
        stockoutRisk = Math.min(95, Math.round((1 - (stock / reorderPoint)) * 100));
    } else if (stock > (reorderPoint + eoq * 1.5)) {
        status = 'OVERSTOCK';
        recommendation = `Excess inventory detected. Consider promotion or reduced ordering.`;
        stockoutRisk = 0;
    }

    return {
        id: product.id,
        name: product.product.name,
        stock,
        incomingStock: product.incomingStock || 0,
        price: product.price,
        averageDailyUsage: parseFloat(avgUsage.toFixed(1)),
        standardDeviation: parseFloat(stdDev.toFixed(2)),
        leadTimeDays: leadTime,
        safetyStock,
        reorderPoint,
        eoq,
        stockoutRisk,
        daysCover,
        salesHistory: history,
        forecast,
        status,
        recommendation
    };
}

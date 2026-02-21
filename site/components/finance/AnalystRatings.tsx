import { getAnalystRatings } from "@/app/actions/fmp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @ai-context Displays analyst ratings consensus and the number of ratings.
 * @ai-related site/app/actions/fmp.ts
 */
export default async function AnalystRatings({ symbol }: { symbol: string }) {
  const ratings = await getAnalystRatings(symbol);

  if (!ratings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyst Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Ratings data not available.</p>
        </CardContent>
      </Card>
    );
  }

  const totalRatings =
    ratings.strongBuy + ratings.buy + ratings.hold + ratings.sell + ratings.strongSell;

  const getConsensus = () => {
    if (totalRatings === 0) return "N/A";
    const score =
      (ratings.strongBuy * 5 +
        ratings.buy * 4 +
        ratings.hold * 3 +
        ratings.sell * 2 +
        ratings.strongSell * 1) /
      totalRatings;

    if (score >= 4.5) return "Strong Buy";
    if (score >= 3.5) return "Buy";
    if (score >= 2.5) return "Hold";
    if (score >= 1.5) return "Sell";
    return "Strong Sell";
  };

  const consensus = getConsensus();

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case "Strong Buy":
      case "Buy":
        return "text-green-500";
      case "Hold":
        return "text-yellow-500";
      case "Sell":
      case "Strong Sell":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyst Ratings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Consensus</p>
            <p className={`text-2xl font-bold ${getConsensusColor(consensus)}`}>
              {consensus}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Total Ratings</p>
            <p className="text-2xl font-bold">{totalRatings}</p>
          </div>
        </div>

        {totalRatings > 0 && (
          <div className="space-y-2">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="bg-green-600"
                style={{ width: `${(ratings.strongBuy / totalRatings) * 100}%` }}
              />
              <div
                className="bg-green-400"
                style={{ width: `${(ratings.buy / totalRatings) * 100}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${(ratings.hold / totalRatings) * 100}%` }}
              />
              <div
                className="bg-red-400"
                style={{ width: `${(ratings.sell / totalRatings) * 100}%` }}
              />
              <div
                className="bg-red-600"
                style={{ width: `${(ratings.strongSell / totalRatings) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Buy</span>
              <span>Hold</span>
              <span>Sell</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { getCompanyProfile } from "@/app/actions/fmp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, Building2, Briefcase, DollarSign } from "lucide-react";

/**
 * @ai-context Displays company profile information including description, sector, industry, CEO, website, and market cap.
 * @ai-related site/app/actions/fmp.ts
 */
export default async function CompanyProfile({ symbol }: { symbol: string }) {
  const profile = await getCompanyProfile(symbol);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Profile data not available.</p>
        </CardContent>
      </Card>
    );
  }

  const formatMarketCap = (value?: number) => {
    if (!value) return "N/A";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {profile.description || "No description available."}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <Building2 className="mr-2 h-4 w-4" />
              Sector
            </div>
            <p className="font-medium">{profile.sector || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <Briefcase className="mr-2 h-4 w-4" />
              Industry
            </div>
            <p className="font-medium">{profile.industry || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-2 h-4 w-4" />
              CEO
            </div>
            <p className="font-medium">{profile.ceo || "N/A"}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="mr-2 h-4 w-4" />
              Market Cap
            </div>
            <p className="font-medium">{formatMarketCap(profile.marketCap)}</p>
          </div>
        </div>

        {profile.website && (
          <div className="pt-2">
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <Globe className="mr-2 h-4 w-4" />
              {new URL(profile.website).hostname.replace("www.", "")}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

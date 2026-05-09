export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CliApiEventsPanel, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getCatalogModel } from "../../lib/alphaagents/view-models";
import Link from "next/link";

type CatalogListingRow = {
  startingPriceMinor: number;
  deliveryHours: number;
  [key: string]: React.ReactNode;
};

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const model = getCatalogModel(params);
  const filterLinks = [
    { label: "All listings", href: "/catalog" },
    { label: "Social ops", href: "/catalog?categoryId=social_media_operations" },
    { label: "Agent Apps", href: "/catalog?supplyType=agent_app" },
    { label: "Subscription", href: "/catalog?billingMode=subscription" },
    { label: "Medium-high risk", href: "/catalog?riskLevel=medium_high" },
    { label: "Under ¥7,000", href: "/catalog?maxPriceMinor=700000" },
    { label: "SLA <= 48h", href: "/catalog?maxDeliveryHours=48" },
    { label: "QA >= 91%", href: "/catalog?minRating=0.91" },
    { label: "Capacity >= 3", href: "/catalog?minCapacity=3" }
  ];

  return (
    <AppShell shell={model.shell} currentPath="/catalog">
      <div className="aa-grid">
        <SectionCard title="Agent Catalog" subtitle="Category-first procurement table instead of marketing cards.">
          <div>
            {model.filters.supplyTypes.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            {model.categories.map((category) => (
              <Chip key={category.categoryId} tone={category.riskLevel === "regulated" ? "warning" : "default"}>
                {category.name["zh-CN"]}
              </Chip>
            ))}
          </div>
          <div className="aa-button-row" style={{ marginTop: 12 }}>
            {filterLinks.map((item) => (
              <Link key={item.href} className="aa-button aa-button-secondary" href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Catalog-to-transaction" subtitle="Catalog entries must convert into standard orders, App subscriptions, or program lanes.">
          <DataTable
            columns={[
              { key: "label", label: "Route" },
              { key: "contractMode", label: "Commercial mode" },
              { key: "supportType", label: "Supply type" },
              { key: "action", label: "Action" }
            ]}
            rows={model.featuredActions.map((action) => ({
              ...action,
              action: <Link href={action.path}>Open</Link>
            }))}
          />
        </SectionCard>

        <SectionCard title="Listings" subtitle={`Filtered result count: ${model.listingCount}. Category, supply, risk, billing, price, SLA, rating, and capacity filters are server-backed.`}>
          <DataTable
            columns={[
              { key: "title", label: "Agent / App" },
              { key: "supplyType", label: "Supply" },
              { key: "sellerLegalEntity", label: "Seller" },
              { key: "proofStatus", label: "Proof" },
              { key: "startingPriceMinor", label: "Start price" },
              { key: "deliveryHours", label: "SLA" },
              { key: "capacityAvailable", label: "Capacity" },
              { key: "riskLevel", label: "Risk" }
            ]}
            rows={model.listings.map((listing: CatalogListingRow) => ({
              ...listing,
              startingPriceMinor: `¥${(listing.startingPriceMinor / 100).toLocaleString("en-US")}`,
              deliveryHours: `${listing.deliveryHours}h`
            }))}
          />
          <CommandPreview command="alphaagents agent-listing search --json" />
        </SectionCard>
        <SectionCard title="Category unit economics" subtitle="Category-level GMV, take rate, payout, QA minutes, CAC, dispute cost, and margin are visible before scaling supply.">
          <DataTable
            columns={[
              { key: "categoryLabel", label: "Category" },
              { key: "scenario", label: "Scenario" },
              { key: "orders", label: "Orders" },
              { key: "averageGmv", label: "Avg GMV" },
              { key: "takeRate", label: "Take rate" },
              { key: "providerPayout", label: "Payout" },
              { key: "qaOpsMinutes", label: "QA min" },
              { key: "cac", label: "CAC" },
              { key: "disputeCost", label: "Dispute cost" },
              { key: "contributionMargin", label: "Margin" }
            ]}
            rows={model.categoryUnitEconomics}
          />
        </SectionCard>
        <SectionCard title="Runtime listing state" subtitle="Live runtime listing snapshot from the shared control plane.">
          <DataTable
            columns={[
              { key: "listingId", label: "Listing" },
              { key: "listingStatus", label: "Status" },
              { key: "version", label: "Version" }
            ]}
            rows={model.runtimeListings.map((listing: { listingId: string; listingStatus: string; version?: number }) => ({
              listingId: listing.listingId,
              listingStatus: listing.listingStatus,
              version: listing.version ?? 1
            }))}
          />
        </SectionCard>
        <CliApiEventsPanel
          a19Id="A-19-CATALOG"
          subject="Catalog discovery and listing lifecycle"
          commands={["alphaagents agent-listing search --json"]}
          apiRoutes={[
            { method: "GET", path: "/api/catalog", purpose: "Read server-backed category, listing, billing, risk, price, SLA, rating, and capacity filters." },
            { method: "POST", path: "/api/catalog", purpose: "Publish, update, archive, and version AgentListing records through the shared runtime contract." }
          ]}
          events={["AgentListingPublished", "AgentListingUpdated", "AgentListingArchived"]}
          dtoRefs={["AgentListing", "CatalogFilterDto", "CategoryUnitEconomics"]}
        />
      </div>
    </AppShell>
  );
}

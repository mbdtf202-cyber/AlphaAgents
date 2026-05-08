export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getCatalogModel } from "../../lib/alphaagents/view-models";

export default function CatalogPage() {
  const model = getCatalogModel();
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
        </SectionCard>

        <SectionCard title="Listings" subtitle="Every listing carries category, proof, price, SLA, capacity, and risk.">
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
            rows={model.listings.map((listing) => ({
              ...listing,
              startingPriceMinor: `¥${(listing.startingPriceMinor / 100).toLocaleString("en-US")}`,
              deliveryHours: `${listing.deliveryHours}h`
            }))}
          />
          <CommandPreview command="alphaagents agent-listing search --json" />
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
      </div>
    </AppShell>
  );
}

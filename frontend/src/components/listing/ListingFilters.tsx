import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useCities, type BrowseFilters } from "@/lib/api/queries";

const conditions = ["NEW", "USED", "REFURBISHED"] as const;

export function ListingFilters({
  value,
  onChange,
  onClear,
}: {
  value: BrowseFilters;
  onChange: (next: { [K in keyof BrowseFilters]?: BrowseFilters[K] | undefined }) => void;
  onClear: () => void;
}) {
  const { data: categories } = useCategories();
  const { data: cities } = useCities();

  return (
    <aside className="tm-card h-fit space-y-6 p-5" aria-label="Listing filters">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-lg border border-verified/30 bg-verified/5 p-3">
        <div className="min-w-0">
          <Label htmlFor="verified-only" className="text-sm font-semibold">
            Verified only
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Show only listings whose fields TrustMart checked itself.
          </p>
        </div>
        <Switch
          id="verified-only"
          checked={Boolean(value.verifiedOnly)}
          onCheckedChange={(checked) => onChange({ verifiedOnly: checked })}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Category
        </legend>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onChange({ categorySlug: undefined })}
            className={`rounded-md px-2 py-1.5 text-start text-sm ${!value.categorySlug ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted"}`}
          >
            All categories
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange({ categorySlug: category.slug })}
              className={`rounded-md px-2 py-1.5 text-start text-sm ${value.categorySlug === category.slug ? "bg-muted font-semibold" : "text-muted-foreground hover:bg-muted"}`}
            >
              {category.nameEn}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price range (PKR)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Minimum price"
            placeholder="Min"
            value={value.minPrice ?? ""}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Maximum price"
            placeholder="Max"
            value={value.maxPrice ?? ""}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition-filter" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Condition
        </Label>
        <Select
          value={value.condition ?? "ANY"}
          onValueChange={(next) => onChange({ condition: next === "ANY" ? undefined : next })}
        >
          <SelectTrigger id="condition-filter">
            <SelectValue placeholder="Any condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any condition</SelectItem>
            {conditions.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city-filter" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          City
        </Label>
        <Select
          value={value.city ?? "ANY"}
          onValueChange={(next) => onChange({ city: next === "ANY" ? undefined : next })}
        >
          <SelectTrigger id="city-filter">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">All cities</SelectItem>
            {cities?.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort-filter" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort by
        </Label>
        <Select
          value={value.sort ?? "recent"}
          onValueChange={(next) => onChange({ sort: next as BrowseFilters["sort"] })}
        >
          <SelectTrigger id="sort-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="trust">Lowest risk signals first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        High-risk listings are withheld from public results while TrustMart reviews them — they never
        appear in this grid.
      </p>
    </aside>
  );
}

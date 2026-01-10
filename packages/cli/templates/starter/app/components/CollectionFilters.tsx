import {useSearchParams} from 'react-router';
import {useState} from 'react';

export type SortOption = {
  label: string;
  value: string;
};

export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
};

type CollectionFiltersProps = {
  filters?: FilterGroup[];
  sortOptions?: SortOption[];
  productCount?: number;
};

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {label: 'Featured', value: 'featured'},
  {label: 'Best Selling', value: 'best-selling'},
  {label: 'Alphabetically, A-Z', value: 'title-asc'},
  {label: 'Alphabetically, Z-A', value: 'title-desc'},
  {label: 'Price, Low to High', value: 'price-asc'},
  {label: 'Price, High to Low', value: 'price-desc'},
  {label: 'Date, Old to New', value: 'created-asc'},
  {label: 'Date, New to Old', value: 'created-desc'},
];

/**
 * Collection filters and sorting controls.
 */
export function CollectionFilters({
  filters = [],
  sortOptions = DEFAULT_SORT_OPTIONS,
  productCount,
}: CollectionFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const currentSort = searchParams.get('sort') || 'featured';
  const activeFilters = getActiveFilters(searchParams, filters);

  function handleSortChange(value: string) {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'featured') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', value);
    }
    setSearchParams(newParams);
  }

  function handleFilterChange(groupId: string, value: string) {
    const newParams = new URLSearchParams(searchParams);
    const currentValues = newParams.getAll(groupId);

    if (currentValues.includes(value)) {
      // Remove the filter
      newParams.delete(groupId);
      currentValues
        .filter((v) => v !== value)
        .forEach((v) => newParams.append(groupId, v));
    } else {
      // Add the filter
      newParams.append(groupId, value);
    }

    setSearchParams(newParams);
  }

  function clearAllFilters() {
    const newParams = new URLSearchParams();
    const sort = searchParams.get('sort');
    if (sort) {
      newParams.set('sort', sort);
    }
    setSearchParams(newParams);
  }

  return (
    <div className="mb-8">
      {/* Top bar with product count and sort */}
      <div className="flex items-center justify-between border-b border-secondary-200 pb-4">
        <div className="flex items-center gap-4">
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 rounded-md border border-secondary-300 px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 lg:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeFilters.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Product count */}
          {productCount !== undefined && (
            <span className="text-sm text-secondary-500">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-secondary-600">
            Sort by:
          </label>
          <select
            id="sort"
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-md border border-secondary-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary-500">Active filters:</span>
          {activeFilters.map((filter) => (
            <button
              key={`${filter.groupId}-${filter.value}`}
              type="button"
              onClick={() => handleFilterChange(filter.groupId, filter.value)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 transition-colors hover:bg-primary-100"
            >
              {filter.label}
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-secondary-500 underline-offset-2 hover:text-secondary-700 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter groups (mobile: collapsible, desktop: horizontal) */}
      {filters.length > 0 && (
        <div
          className={`mt-4 space-y-4 lg:flex lg:gap-6 lg:space-y-0 ${
            isFiltersOpen ? 'block' : 'hidden lg:flex'
          }`}
        >
          {filters.map((group) => (
            <FilterGroupComponent
              key={group.id}
              group={group}
              searchParams={searchParams}
              onFilterChange={handleFilterChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FilterGroupComponentProps = {
  group: FilterGroup;
  searchParams: URLSearchParams;
  onFilterChange: (groupId: string, value: string) => void;
};

function FilterGroupComponent({
  group,
  searchParams,
  onFilterChange,
}: FilterGroupComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValues = searchParams.getAll(group.id);

  return (
    <div className="relative">
      {/* Desktop: Dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hidden items-center gap-1 rounded-md border border-secondary-300 px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 lg:flex"
      >
        {group.label}
        {selectedValues.length > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
            {selectedValues.length}
          </span>
        )}
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mobile: Always visible as section */}
      <div className="lg:hidden">
        <h4 className="mb-2 text-sm font-medium text-secondary-900">
          {group.label}
        </h4>
        <div className="space-y-2">
          {group.options.map((option) => (
            <FilterCheckbox
              key={option.value}
              option={option}
              checked={selectedValues.includes(option.value)}
              onChange={() => onFilterChange(group.id, option.value)}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 hidden w-56 rounded-lg border border-secondary-200 bg-white p-4 shadow-lg lg:block">
          <div className="space-y-2">
            {group.options.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={selectedValues.includes(option.value)}
                onChange={() => onFilterChange(group.id, option.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type FilterCheckboxProps = {
  option: FilterOption;
  checked: boolean;
  onChange: () => void;
};

function FilterCheckbox({option, checked, onChange}: FilterCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
      />
      <span className="text-sm text-secondary-700">{option.label}</span>
      {option.count !== undefined && (
        <span className="text-sm text-secondary-400">({option.count})</span>
      )}
    </label>
  );
}

function getActiveFilters(
  searchParams: URLSearchParams,
  filters: FilterGroup[],
) {
  const active: Array<{groupId: string; value: string; label: string}> = [];

  filters.forEach((group) => {
    const values = searchParams.getAll(group.id);
    values.forEach((value) => {
      const option = group.options.find((o) => o.value === value);
      if (option) {
        active.push({
          groupId: group.id,
          value,
          label: `${group.label}: ${option.label}`,
        });
      }
    });
  });

  return active;
}

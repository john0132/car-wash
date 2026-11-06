# frozen_string_literal: true

# A category's public page, addressed by slug: its active services, searchable, filterable
# and paginated. Inactive categories are a 404.
#
# Query cost per request (independent of page size): 1 category lookup,
# 1 COUNT, 1 page of services (+ translations and images, preloaded in bulk), and 1 aggregate
# for the filter facets (+ the category's translations/image on a full load). A filter/search/page change reloads only `services`, `pagination`
# and `filters` (the client sends `only:`), so the category and facets are not re-queried.
class Website::ServiceCategoriesController < Website::BaseController
  include Website::Paginates

  PER_PAGE = 9
  SORTS = %w[name price_asc price_desc].freeze
  DURATION_STEPS = [ 30, 60, 90, 120 ].freeze

  skip_before_action :authenticate
  before_action :perform_authentication
  before_action :set_category

  def show
    services, pagination = paginate(filtered_services, per_page: PER_PAGE)
    services = preload_services(services)

    render inertia: {
      category: -> { category_props },
      services: -> { services.map { |service| service_card_props(service) } },
      pagination: -> { pagination },
      filters: -> { filter_props },
      facets: -> { facet_props }
    }
  end

  private

  def set_category
    @category = ServiceCategory.where(is_active: true).find_by!(slug: params[:slug])
  end

  # Search, filters and sort applied in SQL on the category's active services. Everything
  # is a scope on one relation, so the COUNT and the page query share the same WHERE.
  def filtered_services
    scope = Service.publicly_listed.where(service_category_id: @category.id)
      .search_name(filters[:q])
      .priced_at_least(filters[:min_price])
      .priced_at_most(filters[:max_price])
      .lasting_at_most(filters[:max_duration])
    scope = scope.on_sale if filters[:on_sale]

    case filters[:sort]
    when "price_asc" then scope.cheapest_first
    when "price_desc" then scope.priciest_first
    else scope.ordered_by_name
    end
  end

  # Sanitised once per request; garbage values are dropped rather than erroring.
  def filters
    @filters ||= {
      q: params[:q].to_s.strip.first(100).presence,
      min_price: decimal_param(:min_price),
      max_price: decimal_param(:max_price),
      max_duration: DURATION_STEPS.include?(params[:max_duration].to_i) ? params[:max_duration].to_i : nil,
      on_sale: params[:on_sale] == "1",
      sort: SORTS.include?(params[:sort]) ? params[:sort] : "name"
    }
  end

  def decimal_param(key)
    value = BigDecimal(params[key].to_s, exception: false)
    value if value&.finite? && value >= 0
  end

  def preload_services(services)
    ActiveRecord::Associations::Preloader.new(
      records: services, associations: [ :service_translations, { image_attachment: :blob } ]
    ).call
    services
  end

  # Only loaded when the category prop is sent (not on filter/search/page reloads).
  def category_props
    ActiveRecord::Associations::Preloader.new(
      records: [ @category ], associations: [ :service_category_translations, { image_attachment: :blob } ]
    ).call

    {
      id: @category.id,
      slug: @category.slug,
      name: @category.translated(:name),
      seo_title: @category.translation&.seo_title.presence,
      seo_description: @category.translation&.seo_description.presence,
      image: blob_prop(@category.image)
    }
  end

  def filter_props
    {
      q: filters[:q],
      min_price: filters[:min_price]&.to_f,
      max_price: filters[:max_price]&.to_f,
      max_duration: filters[:max_duration],
      on_sale: filters[:on_sale],
      sort: filters[:sort]
    }
  end

  # Unfiltered bounds of the category, so the price inputs can show the real range.
  # One aggregate query.
  def facet_props
    low, high, sale_count = Service.publicly_listed.where(service_category_id: @category.id)
      .pick(Arel.sql("MIN(COALESCE(services.sale_price, services.price))"),
            Arel.sql("MAX(COALESCE(services.sale_price, services.price))"),
            Arel.sql("COUNT(services.sale_price)"))

    { min_price: low&.floor, max_price: high&.ceil, on_sale_count: sale_count.to_i, durations: DURATION_STEPS }
  end
end

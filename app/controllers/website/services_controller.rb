# frozen_string_literal: true

# The public services list (index) and a single service's page (show, addressed by slug). Only active services in active
# categories are shown; anything else is a 404. The add-on extras are an optional
# prop: the page asks for them (page by page) when the visitor opens the extras drawer.
class Website::ServicesController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  # Every active service in an active category, grouped by category: the starting point
  # for booking. Categories without active services are left out.
  def index
    categories = ServiceCategory.where(is_active: true).ordered_by_name
      .includes(:service_category_translations).to_a
    services = Service.publicly_listed.where(service_category_id: categories.map(&:id)).ordered_by_name
      .includes(:service_translations, image_attachment: :blob).group_by(&:service_category_id)

    render inertia: {
      categories: categories.filter_map do |category|
        items = services[category.id]
        next if items.blank?

        {
          id: category.id,
          slug: category.slug,
          name: category.translation&.name,
          services: items.map { |item| service_card_props(item) }
        }
      end
    }
  end

  def show
    service = Service.includes(:service_translations, image_attachment: :blob,
                               service_category: :service_category_translations)
      .where(is_active: true, service_category_id: ServiceCategory.where(is_active: true).select(:id))
      .find_by!(slug: params[:slug])

    render inertia: {
      service: service_props(service),
      related: related_props(service),
      extras: InertiaRails.optional { extras_props }
    }
  end

  private

  def service_props(service)
    translation = service.translation

    {
      id: service.id,
      slug: service.slug,
      name: service.translated(:name),
      title: service.translated(:title),
      description: service.translated(:description),
      seo_title: translation&.seo_title.presence,
      seo_description: translation&.seo_description.presence,
      price: service.price.to_f,
      sale_price: service.sale_price&.to_f,
      duration_minutes: service.duration_minutes,
      category: service.service_category.translation&.name,
      category_slug: service.service_category.slug,
      image: blob_prop(service.image)
    }
  end

  EXTRAS_PER_PAGE = 5

  # One page of active extras (`extras_page` param), by name.
  def extras_props
    scope = Extra.where(is_active: true)
    total = scope.count
    pages = [ (total.to_f / EXTRAS_PER_PAGE).ceil, 1 ].max
    page = params[:extras_page].to_i.clamp(1, pages)
    extras = scope.ordered_by_name.includes(:extra_translations)
      .limit(EXTRAS_PER_PAGE).offset((page - 1) * EXTRAS_PER_PAGE)

    {
      items: extras.map { |extra| { id: extra.id, name: extra.translation&.name, price: extra.price.to_f } },
      page: page, pages: pages, total: total
    }
  end

  # Other active services in the same category.
  def related_props(service)
    Service.where(is_active: true, service_category_id: service.service_category_id)
      .where.not(id: service.id).ordered_by_name.limit(3)
      .includes(:service_translations, image_attachment: :blob)
      .map do |other|
        {
          id: other.id,
          slug: other.slug,
          name: other.translation&.name,
          price: other.price.to_f,
          sale_price: other.sale_price&.to_f,
          duration_minutes: other.duration_minutes,
          image: blob_prop(other.image)
        }
      end
  end

  def service_card_props(service)
    {
      id: service.id,
      slug: service.slug,
      name: service.translation&.name,
      price: service.price.to_f,
      sale_price: service.sale_price&.to_f,
      duration_minutes: service.duration_minutes,
      image: blob_prop(service.image)
    }
  end

  def blob_prop(attachment)
    attachment.attached? ? { url: rails_blob_path(attachment.blob, only_path: true) } : nil
  end
end

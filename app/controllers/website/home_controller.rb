# frozen_string_literal: true

class Website::HomeController < Website::BaseController
  include Website::RendersPage

  skip_before_action :authenticate
  before_action :perform_authentication

  def index
    render inertia: {
      page: find_page("home")&.render_props,
      home_services: home_services,
      home_categories: home_categories
    }
  end

  private

  # Services flagged "Display on Homepage", in active categories. Filtered in SQL; only the
  # fields the homepage cards show are returned.
  def home_services
    Service.on_home_page.ordered_by_name
      .includes(:service_translations, image_attachment: :blob, service_category: :service_category_translations)
      .map do |service|
        {
          id: service.id,
          slug: service.slug,
          name: service.translation&.name,
          price: service.price.to_f,
          sale_price: service.sale_price&.to_f,
          category: service.service_category.translation&.name,
          image: blob_prop(service.image)
        }
      end
  end

  # Categories flagged "Display on Homepage", with how many active services each offers.
  def home_categories
    categories = ServiceCategory.on_home_page.ordered_by_name
      .includes(:service_category_translations, image_attachment: :blob).to_a
    counts = Service.where(service_category_id: categories.map(&:id), is_active: true)
      .group(:service_category_id).count

    categories.map do |category|
      {
        id: category.id,
        slug: category.slug,
        name: category.translation&.name,
        services_count: counts.fetch(category.id, 0),
        image: blob_prop(category.image)
      }
    end
  end

  def blob_prop(attachment)
    attachment.attached? ? { url: rails_blob_path(attachment.blob, only_path: true) } : nil
  end
end

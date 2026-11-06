# frozen_string_literal: true

# Prop builders shared by the public pages, so a service card or an image has
# one shape (and one translation fallback) everywhere it appears. The shapes
# match `ServiceSummary` and `Image` in app/javascript/website/lib/types.ts.
module Website::PublicProps
  extend ActiveSupport::Concern

  private

  def blob_prop(attachment)
    attachment.attached? ? { url: rails_blob_path(attachment.blob, only_path: true) } : nil
  end

  # Areas a customer can pick, with a point inside each so a map can jump there
  # (`latitude`/`longitude`, null when the area has no geofence).
  def area_options(scope = Area.serviceable)
    scope.with_center.includes(:area_translations, city: :city_translations)
      .map do |area|
        {
          id: area.id, name: area.translated(:name), city: area.city.translated(:name),
          latitude: area.center_latitude&.to_f, longitude: area.center_longitude&.to_f
        }
      end
      .sort_by { |area| [ area[:city].to_s, area[:name].to_s ] }
  end

  # A service as a card. Preload `service_translations` and `image_attachment: :blob`.
  # Names fall back field by field (see Translatable#translated).
  def service_card_props(service, **extra)
    {
      id: service.id,
      slug: service.slug,
      name: service.translated(:name),
      price: service.price.to_f,
      sale_price: service.sale_price&.to_f,
      duration_minutes: service.duration_minutes,
      image: blob_prop(service.image)
    }.merge(extra)
  end
end

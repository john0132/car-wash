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

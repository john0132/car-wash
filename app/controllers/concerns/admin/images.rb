# frozen_string_literal: true

# `{ signed_id:, url: }` image props and assignment of submitted blob signed ids, for
# dashboard forms whose model has a `has_one_attached` image (blog cover, service image…).
module Admin::Images
  extend ActiveSupport::Concern

  private

  def image_prop(attachment)
    return nil unless attachment&.attached?

    { signed_id: attachment.blob.signed_id, url: rails_blob_path(attachment.blob, only_path: true) }
  end

  # Attaches a submitted blob signed id; blank removes the image. Unchanged ids are left alone.
  def assign_image(record, name, signed_id)
    attachment = record.public_send(name)
    signed_id = signed_id.to_s.presence

    if signed_id.nil?
      record.public_send(:"#{name}=", nil) if attachment.attached?
    elsif !attachment.attached? || attachment.blob.signed_id != signed_id
      record.public_send(:"#{name}=", signed_id) if ActiveStorage::Blob.find_signed(signed_id)
    end
  end
end

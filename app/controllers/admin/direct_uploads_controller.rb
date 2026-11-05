# frozen_string_literal: true

# ActiveStorage direct uploads for the dashboard's image fields. It replaces
# ActiveStorage's public endpoint (also routed here, see config/routes.rb), so
# only staff who can edit pages, blogs or components can create blobs, and
# only images of a reasonable size are accepted.
#
# It inherits ActiveStorage's controller rather than Admin::BaseController,
# so the session cookie is checked here directly.
class Admin::DirectUploadsController < ActiveStorage::DirectUploadsController
  MAX_BYTE_SIZE = 10.megabytes
  CONTENT_TYPES = %w[image/png image/jpeg image/webp image/gif image/avif].freeze

  before_action :require_uploader
  before_action :require_image

  private

  # Adds the blob's URL so the editor can preview or embed it before it is attached.
  def direct_upload_json(blob)
    super.merge(url: rails_blob_path(blob, only_path: true))
  end

  def require_uploader
    user = Session.find_by_id(cookies.signed[:session_token])&.user
    head :forbidden unless user && AdminPolicy.new(user, :admin).upload?
  end

  def require_image
    args = blob_args
    return if CONTENT_TYPES.include?(args[:content_type].to_s) && args[:byte_size].to_i.between?(1, MAX_BYTE_SIZE)

    render json: { error: "Upload a PNG, JPEG, WebP, GIF or AVIF image up to #{MAX_BYTE_SIZE / 1.megabyte} MB" },
      status: :unprocessable_content
  end
end

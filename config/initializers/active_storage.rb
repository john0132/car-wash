# frozen_string_literal: true

# Models that include Attachable store a short code instead of their class name
# in every polymorphic `*_type` column (see Media::TYPE_MAP), including
# ActiveStorage's `record_type`. Teach attachments to resolve those codes too,
# so e.g. `Blog has_one_attached :cover_image` loads its record.
Rails.application.config.to_prepare do
  ActiveStorage::Attachment.singleton_class.prepend(Module.new do
    def polymorphic_class_for(name)
      super(Media::TYPE_MAP.key(name) || name)
    end
  end)
end

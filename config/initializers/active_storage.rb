# frozen_string_literal: true

# Models that include PolymorphicTypeCode store a short code instead of their
# class name in every polymorphic `*_type` column, including ActiveStorage's
# `record_type`. Teach attachments to resolve those codes too, so e.g.
# `Package has_many_attached :images` loads its record.
Rails.application.config.to_prepare do
  ActiveStorage::Attachment.singleton_class.prepend(Module.new do
    def polymorphic_class_for(name)
      super(PolymorphicTypeCode::TYPE_MAP.key(name) || name)
    end
  end)
end

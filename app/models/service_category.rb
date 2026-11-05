# frozen_string_literal: true

class ServiceCategory < ApplicationRecord
  include Attachable

  has_many :services, dependent: :destroy
  has_many :service_category_translations, dependent: :destroy
end

# frozen_string_literal: true

class Membership < ApplicationRecord
  HEX_COLOR_REGEXP = /\A#?[0-9a-fA-F]{6}\z/

  has_many :membership_translations, dependent: :destroy
  has_many :users, dependent: :nullify

  validates :egp_to_points, :points_to_egp, presence: true, numericality: { greater_than: 0 }
  validates :background_color, :text_color, presence: true, format: { with: HEX_COLOR_REGEXP }
end

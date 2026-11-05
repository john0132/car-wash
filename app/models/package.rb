# frozen_string_literal: true

class Package < ApplicationRecord
  include Attachable

  has_many :users, dependent: :nullify

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
end

# frozen_string_literal: true

class Address < ApplicationRecord
  belongs_to :user
  belongs_to :area

  validates :name, presence: true
  validates :location, presence: true
end

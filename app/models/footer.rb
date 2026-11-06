# frozen_string_literal: true

# The website footer: a title, description and image, social links and
# columns of links. There is exactly one (see Footer.instance); the dashboard
# edits it and never creates or deletes it. Children `touch` it, so
# `updated_at` is the cache version of everything inside.
class Footer < ApplicationRecord
  include Translatable

  has_many :footer_translations, dependent: :destroy, autosave: true
  has_many :footer_columns, -> { order(:position, :id) }, dependent: :destroy, autosave: true
  has_many :footer_social_links, -> { order(:position, :id) }, dependent: :destroy, autosave: true
  has_one_attached :image

  def self.instance = first || create!
end

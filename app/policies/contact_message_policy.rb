# frozen_string_literal: true

# Dashboard access to contact form entries, gated by "contact_messages.*".
class ContactMessagePolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def destroy? = permit?("delete")
end

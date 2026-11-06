# frozen_string_literal: true

# Dashboard management of FAQs, gated by the "faqs.*" permissions.
class FaqPolicy < ApplicationPolicy
  def index? = permit?("read")
  def show? = permit?("read")
  def create? = permit?("create")
  def update? = permit?("update")
  def destroy? = permit?("delete")
end

# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin cars", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    users(:one).cars.create!(make: "Toyota", model: "Corolla", license_plate: "abc 123", color: "White")
    users(:two).cars.create!(make: "BMW", model: "X5", license_plate: "XYZ 999", color: "Black")
  end

  it "lists cars and filters by search" do
    grant(admin, "cars.read")
    sign_in admin

    get admin_cars_path
    expect_inertia.to render_component("admin/cars/index")
    expect(inertia.props[:cars].size).to eq(2)

    get admin_cars_path, params: { q: "abc 123" }
    expect(inertia.props[:cars].pluck(:make)).to eq([ "Toyota" ])
  end

  it "is forbidden without cars.read" do
    sign_in admin
    get admin_cars_path
    expect(response).to redirect_to(admin_root_path)
  end

  it "has no routes to create or change cars" do
    expect { Rails.application.routes.recognize_path("/admin/cars", method: :post) }
      .to raise_error(ActionController::RoutingError)
    expect { Rails.application.routes.recognize_path("/admin/cars/1", method: :patch) }
      .to raise_error(ActionController::RoutingError)
  end
end

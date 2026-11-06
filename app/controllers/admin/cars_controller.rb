# frozen_string_literal: true

# Cars are added by customers on the website, so the dashboard can only list them.
class Admin::CarsController < Admin::BaseController
  include Admin::Pagination

  after_action :verify_authorized

  def index
    authorize Car

    cars, pagination = paginate(Car.search(params[:q]).includes(:user).order(created_at: :desc, id: :desc))

    render inertia: {
      cars: cars.map { |car| car_props(car) },
      filters: { q: params[:q].presence },
      pagination: pagination
    }
  end

  private

  def car_props(car)
    {
      id: car.id,
      make: car.make,
      model: car.model,
      license_plate: car.license_plate,
      color: car.color,
      customer: { id: car.user.id, full_name: car.user.full_name, email: car.user.email },
      created_at: car.created_at
    }
  end
end

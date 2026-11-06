# frozen_string_literal: true

class Website::Profile::CarsController < Website::BaseController
  before_action :set_car, only: %i[update destroy]

  def index
    render inertia: { cars: Current.user.cars.order(:created_at, :id).map { |car| car_props(car) } }
  end

  def create
    save Current.user.cars.new, notice: "Car added"
  end

  def update
    save @car, notice: "Car updated"
  end

  def destroy
    @car.destroy!
    redirect_to profile_cars_path, notice: "Car removed"
  end

  private

  def set_car
    @car = Current.user.cars.find(params[:id])
  end

  def save(car, notice:)
    car.assign_attributes(params.permit(:make, :model, :license_plate, :color))

    if car.save
      redirect_to profile_cars_path, notice: notice
    else
      redirect_to profile_cars_path, inertia: { errors: car.errors.to_hash }
    end
  end

  def car_props(car)
    { id: car.id, make: car.make, model: car.model, license_plate: car.license_plate, color: car.color }
  end
end

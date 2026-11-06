# frozen_string_literal: true

class Website::Profile::CarsController < Website::BaseController
  before_action :set_car, only: %i[update destroy]

  def index
    render inertia: { cars: Current.user.cars.order(:created_at, :id).map { |car| car_props(car) } }
  end

  # Returns to the page that added the car (checkout adds one inline), else the cars tab.
  def create
    save Current.user.cars.new, notice: t("website.flash.car_added"), back: true
  end

  def update
    save @car, notice: t("website.flash.car_updated")
  end

  def destroy
    @car.destroy!
    redirect_to profile_cars_path, notice: t("website.flash.car_removed")
  end

  private

  def set_car
    @car = Current.user.cars.find(params[:id])
  end

  def save(car, notice:, back: false)
    car.assign_attributes(params.permit(:make, :model, :license_plate, :color))
    options = car.save ? { notice: notice } : { inertia: { errors: car.errors.to_hash } }

    if back
      redirect_back_or_to profile_cars_path, **options
    else
      redirect_to profile_cars_path, **options
    end
  end

  def car_props(car)
    { id: car.id, make: car.make, model: car.model, license_plate: car.license_plate, color: car.color }
  end
end

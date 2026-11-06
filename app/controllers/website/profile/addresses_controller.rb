# frozen_string_literal: true

class Website::Profile::AddressesController < Website::BaseController
  before_action :set_address, only: %i[update destroy]

  def index
    render inertia: {
      addresses: Current.user.addresses.includes(area: [ :area_translations, { city: :city_translations } ])
        .order(:created_at).map { |address| address_props(address) },
      areas: area_options(Area.where(is_active: true))
    }
  end

  def create
    save Current.user.addresses.new, notice: t("website.flash.address_added")
  end

  def update
    save @address, notice: t("website.flash.address_updated")
  end

  def destroy
    @address.destroy!
    redirect_to profile_addresses_path, notice: t("website.flash.address_removed")
  end

  private

  def set_address
    @address = Current.user.addresses.find(params[:id])
  end

  def save(address, notice:)
    address.assign_attributes(params.permit(:name, :area_id))
    address.assign_coordinates(params[:latitude], params[:longitude])

    if address.save
      redirect_to profile_addresses_path, notice: notice
    else
      errors = address.errors.to_hash
      errors[:latitude] = errors.delete(:location) if errors.key?(:location)
      redirect_to profile_addresses_path, inertia: { errors: errors }
    end
  end

  def address_props(address)
    {
      id: address.id,
      name: address.name,
      area_id: address.area_id,
      area: address.area.translated(:name),
      city: address.area.city.translated(:name),
      latitude: address.latitude,
      longitude: address.longitude
    }
  end
end

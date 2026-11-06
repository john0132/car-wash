# frozen_string_literal: true

# A customer booking one service (plus optional extras) for a car, a location
# and a time slot. Holds every checkout rule, so the controller only builds it
# from params and calls `save`. Prices and coverage always come from the
# database, never from the browser.
#
#   checkout = Checkout.new(user: Current.user, service_slug: "exterior-wash", extra_ids: [3],
#                           car_id: 7, latitude: "30.04", longitude: "31.23",
#                           scheduled_at: "2026-11-08T10:00:00+02:00")
#   checkout.save    # => true
#   checkout.booking # => #<Booking …>
#
# Payment is cash on arrival for now: the booking starts unpaid with a pending
# cash transaction.
class Checkout
  include ActiveModel::Model
  include ActiveModel::Attributes

  PAYMENT_METHOD_CODE = "cash"
  PINNED_LOCATION_NAME = "Pinned location"

  attr_accessor :user
  attr_reader :booking

  attribute :service_slug, :string
  attribute :extra_ids, default: -> { [] }
  attribute :car_id, :integer
  attribute :address_id, :integer
  attribute :latitude, :string
  attribute :longitude, :string
  attribute :scheduled_at, :datetime
  attribute :phone, :string

  # Attribute names for full messages are in config/locales/en.yml.
  validates :service, presence: { message: "is no longer available" }
  validates :car_id, presence: { message: "must be chosen" }
  validate :car_belongs_to_user
  validate :location_is_covered
  validate :scheduled_at_is_a_slot
  validate :phone_is_set
  validate :payment_method_available

  def service
    return @service if defined?(@service)

    @service = service_slug.present? ? Service.bookable.includes(:service_translations).find_by(slug: service_slug) : nil
  end

  # Unknown or disabled extras are dropped, so the summary shows exactly what will be booked.
  def extras
    @extras ||= Extra.where(is_active: true, id: Array(extra_ids).map(&:to_i).uniq)
      .ordered_by_name.includes(:extra_translations).to_a
  end

  def car
    return @car if defined?(@car)

    @car = car_id && user.cars.find_by(id: car_id)
  end

  def address
    return @address if defined?(@address)

    @address = address_id && user.addresses.find_by(id: address_id)
  end

  # A saved address is the source of truth for its location; otherwise the pinned coordinates.
  def point
    return @point if defined?(@point)

    @point = address&.location || point_from_coordinates
  end

  def area
    return @area if defined?(@area)

    @area = point && Area.serviceable.covering(point).includes(:area_translations, city: :city_translations).first
  end

  def subtotal
    service ? service.sale_price || service.price : 0
  end

  def extras_total
    extras.sum(&:price)
  end

  def total
    subtotal + extras_total
  end

  def needs_phone?
    user.phone.blank?
  end

  # For the live check at checkout: nil until a location is picked.
  def coverage
    return unless point

    {
      covered: area.present?,
      area: area&.translated(:name),
      city: area&.city&.translated(:name)
    }
  end

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      user.update!(phone: phone) if needs_phone?
      @booking = create_booking!
    end
    true
  end

  private

  def create_booking!
    user.bookings.create!(
      car: car,
      car_description: car.description,
      scheduled_at: scheduled_at,
      subtotal: subtotal,
      extras_total: extras_total,
      total_amount: total
    ).tap do |booking|
      booking.booking_items.create!(itemable: service, price: subtotal)
      extras.each { |extra| booking.booking_items.create!(itemable: extra, price: extra.price) }
      booking.create_booking_address!(
        address: address,
        name: address&.name || PINNED_LOCATION_NAME,
        area_name: area.translated(:name),
        city_name: area.city.translated(:name),
        location: point
      )
      booking.payment_transactions.create!(user: user, payment_method: payment_method, amount: total, status: :pending)
    end
  end

  def payment_method
    @payment_method ||= PaymentMethod.find_by(code: PAYMENT_METHOD_CODE, is_active: true)
  end

  def point_from_coordinates
    lat = Float(latitude)
    lng = Float(longitude)
    return unless lat.between?(-90, 90) && lng.between?(-180, 180)

    Area::GEO_FACTORY.point(lng, lat)
  rescue ArgumentError, TypeError
    nil
  end

  def car_belongs_to_user
    errors.add(:car_id, "is not one of your cars") if car_id && car.nil?
  end

  def location_is_covered
    if point.nil?
      errors.add(:location, "must be chosen")
    elsif area.nil?
      errors.add(:location, "is outside our service area")
    end
  end

  def scheduled_at_is_a_slot
    errors.add(:scheduled_at, "must be one of the available times") unless BookingSlots.include?(scheduled_at)
  end

  def phone_is_set
    return unless needs_phone?

    if phone.blank?
      errors.add(:phone, "is required to book")
    elsif !phone.squish.match?(User::PHONE_FORMAT)
      errors.add(:phone, "must be a valid phone number")
    end
  end

  def payment_method_available
    errors.add(:base, "Bookings are not available right now") unless payment_method
  end
end

# frozen_string_literal: true

# The appointment times a customer can book at checkout: hourly slots within
# opening hours, from LEAD_TIME from now up to DAYS_AHEAD days out. There is no
# capacity limit yet, so any listed slot is bookable.
#
#   BookingSlots.include?(Time.zone.parse("2026-11-08 10:00")) # => true
module BookingSlots
  OPENING_HOUR = 9
  CLOSING_HOUR = 21 # the last slot starts an hour before
  DAYS_AHEAD = 14
  LEAD_TIME = 2.hours

  module_function

  # Every bookable slot start, earliest first.
  def upcoming(now = Time.current)
    earliest = now + LEAD_TIME
    (0..DAYS_AHEAD).flat_map do |offset|
      day = now.to_date + offset
      (OPENING_HOUR...CLOSING_HOUR).map { |hour| day.in_time_zone.change(hour: hour) }
    end.select { |slot| slot >= earliest }
  end

  def include?(time, now = Time.current)
    return false if time.blank?

    upcoming(now).include?(time.in_time_zone.change(sec: 0))
  end

  # The checkout prop: slots grouped by day, labels formatted in the app's
  # time zone so the browser's own zone never shifts them.
  def grouped(now = Time.current)
    upcoming(now).group_by(&:to_date).map do |date, slots|
      {
        date: date.iso8601,
        label: I18n.l(date, format: "%a %-d %b"),
        slots: slots.map { |slot| { value: slot.iso8601, label: slot.strftime("%H:%M") } }
      }
    end
  end
end

# frozen_string_literal: true

require "rails_helper"

RSpec.describe BookingSlots do
  let(:now) { Time.zone.parse("2026-11-07 10:30") }

  describe ".upcoming" do
    subject(:slots) { described_class.upcoming(now) }

    it "starts after the lead time, on the hour" do
      expect(slots.first).to eq(Time.zone.parse("2026-11-07 13:00"))
    end

    it "stays within opening hours" do
      expect(slots.map(&:hour).uniq.sort).to eq((9..20).to_a)
    end

    it "goes DAYS_AHEAD days out" do
      expect(slots.last).to eq(Time.zone.parse("2026-11-21 20:00"))
    end
  end

  describe ".include?" do
    it "accepts a listed slot, in any time zone" do
      expect(described_class.include?(Time.zone.parse("2026-11-08 09:00").utc, now)).to be(true)
    end

    it "rejects off-hour, too-soon, too-late and blank times" do
      [ "2026-11-08 09:30", "2026-11-08 21:00", "2026-11-07 11:00", "2026-11-22 10:00" ].each do |time|
        expect(described_class.include?(Time.zone.parse(time), now)).to be(false), time
      end
      expect(described_class.include?(nil, now)).to be(false)
    end
  end

  describe ".grouped" do
    it "groups slots by day with server-formatted labels" do
      day = described_class.grouped(now).first

      expect(day).to include(date: "2026-11-07", label: "Sat 7 Nov")
      expect(day[:slots].first).to eq(value: "2026-11-07T13:00:00+02:00", label: "13:00")
    end
  end
end

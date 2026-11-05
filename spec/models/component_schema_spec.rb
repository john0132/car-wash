# frozen_string_literal: true

require "rails_helper"

RSpec.describe ComponentSchema do
  let(:schema) do
    described_class.new([
      { key: "heading", type: "string", translatable: true, required: true },
      { key: "body", type: "rich_text", translatable: "true" },
      { key: "button_url", type: "url" },
      { key: "image", type: "image", translatable: true },
      { key: "style", type: "select", options: [ "primary", " muted ", "" ] },
      { key: "count", type: "number" },
      { key: "boxed", type: "boolean" },
      { key: "items", type: "repeater", required: true, fields: [
        { key: "title", type: "string", translatable: true, required: true },
        { key: "icon", type: "image" }
      ] }
    ])
  end

  describe ".normalize" do
    it "fills labels, casts flags, cleans options and only lets text be translatable" do
      fields = schema.fields.index_by(&:key)

      expect(fields["button_url"].label).to eq("Button url")
      expect(fields["body"].translatable).to be(true)
      expect(fields["image"].translatable).to be(false)
      expect(fields["items"].translatable).to be(false)
      expect(fields["style"].options).to eq(%w[primary muted])
    end
  end

  describe "#errors" do
    it "is empty for a valid schema" do
      expect(schema.errors).to be_empty
    end

    it "reports bad keys, unknown types, options, duplicates and nested lists" do
      errors = described_class.new([
        { key: "Bad Key", type: "string" },
        { key: "a", type: "nope" },
        { key: "a", type: "select" },
        { key: "_id", type: "string" },
        { key: "list", type: "repeater", fields: [ { key: "inner", type: "repeater", fields: [ { key: "x", type: "string" } ] } ] },
        { key: "empty", type: "repeater", fields: [] }
      ]).errors

      expect(errors).to include(
        a_string_including("\"Bad Key\" must start with a letter"),
        "\"a\" has an unknown type \"nope\"",
        "\"a\" needs at least one option",
        "key \"a\" is used more than once",
        "key \"_id\" must start with a letter and use only a-z, 0-9 and _",
        "in list \"list\": \"inner\" can't be a list inside a list",
        "list \"empty\" needs at least one field"
      )
    end
  end

  describe "#clean_settings / #clean_content" do
    it "splits values by translatability, coerces them and drops unknown keys" do
      settings = schema.clean_settings(
        "heading" => "ignored here", "button_url" => " /book ", "style" => "loud", "count" => "3",
        "boxed" => "1", "junk" => "x",
        "items" => [ { "_id" => "a", "icon" => "sig", "title" => "ignored", "x" => 1 }, { "icon" => "" } ]
      )

      expect(settings.except("items")).to eq("button_url" => "/book", "count" => 3, "boxed" => true)
      expect(settings["items"].first).to eq("_id" => "a", "icon" => "sig")
      expect(settings["items"].second["_id"]).to be_present

      content = schema.clean_content(
        { "heading" => " Hi ", "body" => "<p>x</p><script>y</script>", "button_url" => "/no",
          "items" => { "a" => { "title" => "One", "icon" => "no" }, "gone" => { "title" => "Orphan" } } },
        settings
      )

      expect(content).to eq("heading" => "Hi", "body" => "<p>x</p>y", "items" => { "a" => { "title" => "One" } })
    end
  end

  describe "#value_errors" do
    it "checks required shared values and url format without content" do
      errors = schema.value_errors({ "button_url" => "javascript:x" }, nil)

      expect(errors).to eq(
        "button_url" => [ "must be a URL starting with https://, http:// or /" ],
        "items" => [ "needs at least one item" ]
      )
    end

    it "checks required translatable values, including inside repeater items" do
      settings = { "items" => [ { "_id" => "a" } ] }
      errors = schema.value_errors(settings, { "items" => { "a" => { "title" => "" } } })

      expect(errors).to include("heading" => [ "can't be blank" ], "items.0.title" => [ "can't be blank" ])
    end
  end

  it "lists every image value, including in repeaters" do
    expect(schema.image_values("image" => "one", "items" => [ { "_id" => "a", "icon" => "two" }, { "_id" => "b" } ]))
      .to eq(%w[one two])
  end
end

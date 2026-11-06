# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website blogs", type: :request do
  def create_blog(slug:, title: slug.titleize, is_active: true)
    blog = Blog.new(slug: slug, is_active: is_active)
    blog.blog_translations.build(language: english, name: title, title: title, body: "<p>Body of #{title}</p>")
    blog.save!
    blog
  end

  it "lists active blogs and hides inactive ones" do
    create_blog(slug: "visible")
    create_blog(slug: "hidden", is_active: false)

    get blogs_path

    expect(response).to have_http_status(:success)
    expect_inertia.to render_component("website/blogs/index")
    expect(inertia.props[:blogs].pluck(:slug)).to eq([ "visible" ])
  end

  it "shows a blog by slug" do
    create_blog(slug: "hello", title: "Hello")

    get blog_path("hello")

    expect(response).to have_http_status(:success)
    expect_inertia.to render_component("website/blogs/show")
    expect(inertia.props[:blog][:title]).to eq("Hello")
  end

  it "404s for inactive or unknown blogs" do
    create_blog(slug: "hidden", is_active: false)

    get blog_path("hidden")
    expect(response).to have_http_status(:not_found)
  end

  it "shows up to three random blogs on the home page" do
    4.times { |i| create_blog(slug: "post-#{i}") }

    get root_path

    expect(inertia.props[:home_blogs].size).to eq(3)
  end
end

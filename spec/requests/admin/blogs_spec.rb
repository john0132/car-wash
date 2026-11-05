# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin blogs", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def blog_params(slug: "winter-tips", title: "Winter tips", body: "<p>Wash often</p>", cover_image: "", ar: {})
    blank = { name: "", title: "", subtitle: "", body: "", seo_title: "", seo_description: "", seo_image: "" }
    {
      blog: {
        slug: slug, is_active: true, cover_image: cover_image,
        translations: {
          english.id.to_s => blank.merge(name: "Winter", title: title, body: body),
          arabic.id.to_s => blank.merge(ar)
        }
      }
    }
  end

  describe "GET /admin/blogs" do
    it "lists posts, newest first, searchable by name or slug" do
      grant(admin, "blogs.read")
      create_blog(slug: "old-post", name: "Old")
      create_blog(slug: "new-post", name: "New")

      get admin_blogs_path

      expect_inertia.to render_component("admin/blogs/index")
      expect(inertia.props[:blogs].pluck(:slug)).to eq(%w[new-post old-post])

      get admin_blogs_path, params: { q: "old" }
      expect(inertia.props[:blogs].pluck(:slug)).to eq(%w[old-post])
    end

    it "is forbidden without blogs.read" do
      get admin_blogs_path
      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "POST /admin/blogs" do
    it "creates a post with a sanitized body and a cover image" do
      grant(admin, "blogs.create")
      blob = uploaded_blob

      post admin_blogs_path, as: :json,
        params: blog_params(body: "<p>Hi</p><script>x()</script>", cover_image: blob.signed_id,
                            ar: { name: "شتاء", title: "نصائح" })

      blog = Blog.last
      expect(response).to redirect_to(edit_admin_blog_path(blog))
      expect(blog.cover_image.blob).to eq(blob)
      expect(blog.translation(:en).body).to eq("<p>Hi</p>x()")
      expect(blog.blog_translations.map { |t| t.language.code }).to contain_exactly("en", "ar")
    end

    it "returns errors keyed by language" do
      grant(admin, "blogs.create")

      post admin_blogs_path, as: :json, params: blog_params(ar: { name: "شتاء" })

      follow_redirect!
      expect(inertia.props[:errors]).to include("translations.#{arabic.id}.title": [ "can't be blank" ])
    end
  end

  describe "PATCH /admin/blogs/:id" do
    it "removes a language whose fields are all blank" do
      grant(admin, "blogs.update")
      blog = create_blog
      blog.blog_translations.create!(language: arabic, name: "افتتاح", title: "افتتاح")

      patch admin_blog_path(blog), as: :json, params: blog_params(slug: blog.slug)

      expect(response).to redirect_to(edit_admin_blog_path(blog))
      expect(blog.reload.blog_translations.map(&:language_id)).to eq([ english.id ])
    end
  end

  describe "DELETE /admin/blogs/:id" do
    it "deletes the post" do
      grant(admin, "blogs.delete")
      blog = create_blog

      expect { delete admin_blog_path(blog) }.to change(Blog, :count).by(-1)
    end
  end
end

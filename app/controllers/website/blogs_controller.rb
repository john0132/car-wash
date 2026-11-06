# frozen_string_literal: true

# Public blog: a paginated list of active blogs (newest first) and a single blog by slug.
class Website::BlogsController < Website::BaseController
  skip_before_action :authenticate
  before_action :perform_authentication

  PER_PAGE = 9

  def index
    scope = Blog.where(is_active: true)
    pages = [ (scope.count.to_f / PER_PAGE).ceil, 1 ].max
    page = params[:page].to_i.clamp(1, pages)
    blogs = scope.order(created_at: :desc, id: :desc).limit(PER_PAGE).offset((page - 1) * PER_PAGE)
      .includes(:blog_translations, cover_image_attachment: :blob)

    render inertia: {
      blogs: blogs.map { |blog| card_props(blog) },
      page: page,
      pages: pages
    }
  end

  def show
    blog = Blog.where(is_active: true).includes(:blog_translations, cover_image_attachment: :blob)
      .find_by!(slug: params[:slug])
    translation = blog.translation

    render inertia: {
      blog: card_props(blog).merge(
        body: blog.translated(:body),
        seo_title: translation&.seo_title.presence,
        seo_description: translation&.seo_description.presence
      ),
      related: related_props(blog)
    }
  end

  private

  def card_props(blog)
    {
      id: blog.id,
      slug: blog.slug,
      title: blog.translated(:title),
      subtitle: blog.translated(:subtitle),
      cover_image: blob_prop(blog.cover_image),
      published_at: blog.created_at.iso8601
    }
  end

  def related_props(blog)
    Blog.where(is_active: true).where.not(id: blog.id).order(created_at: :desc).limit(3)
      .includes(:blog_translations, cover_image_attachment: :blob)
      .map { |other| card_props(other) }
  end

  def blob_prop(attachment)
    attachment.attached? ? { url: rails_blob_path(attachment.blob, only_path: true) } : nil
  end
end

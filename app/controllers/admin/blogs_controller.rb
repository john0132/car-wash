# frozen_string_literal: true

# Blog posts. Text (title, rich text body, SEO) is per language in blog_translations;
# the body is sanitized HTML from the dashboard's rich text editor.
class Admin::BlogsController < Admin::BaseController
  include Admin::Activation
  include Admin::Pagination
  include Admin::ContentTranslations

  TRANSLATION_FIELDS = %i[name title subtitle body seo_title seo_description].freeze
  TRANSLATION_IMAGES = %i[seo_image].freeze

  after_action :verify_authorized

  before_action :set_blog, only: %i[edit update destroy activation]

  def index
    authorize Blog

    scope = Blog.search(params[:q]).with_status(params[:status])
    blogs, pagination = paginate(scope.order(updated_at: :desc, id: :desc))
    blogs = blogs.includes(:blog_translations, cover_image_attachment: :blob)

    render inertia: {
      blogs: blogs.map { |blog| blog_row(blog) },
      filters: { q: params[:q].presence, status: params[:status].presence },
      pagination: pagination
    }
  end

  def new
    blog = Blog.new(is_active: true)
    authorize blog
    render inertia: form_props(blog)
  end

  def create
    blog = Blog.new
    authorize blog

    if save(blog)
      redirect_to edit_admin_blog_path(blog), notice: "#{display_name(blog)} was created"
    else
      redirect_to new_admin_blog_path, inertia: { errors: content_errors(blog) }
    end
  end

  def edit
    authorize @blog, :update?
    render inertia: form_props(@blog)
  end

  def update
    authorize @blog

    if save(@blog)
      redirect_to edit_admin_blog_path(@blog), notice: "#{display_name(@blog)} was updated"
    else
      redirect_to edit_admin_blog_path(@blog), inertia: { errors: content_errors(@blog) }
    end
  end

  def destroy
    authorize @blog

    if @blog.destroy
      redirect_to admin_blogs_path, notice: "#{display_name(@blog)} was deleted"
    else
      redirect_back_or_to edit_admin_blog_path(@blog), alert: @blog.errors.full_messages.to_sentence
    end
  end

  def activation
    authorize @blog, :update?
    update_record_activation(@blog, name: display_name(@blog), fallback: admin_blogs_path)
  end

  private

  def set_blog
    @blog = Blog.includes(blog_translations: { seo_image_attachment: :blob }).find(params[:id])
  end

  def blog_params
    params.expect(blog: %i[slug is_active])
  end

  def save(blog)
    blog.assign_attributes(blog_params)
    blog.slug = blog.slug.to_s.strip.downcase
    raw = params.to_unsafe_h[:blog] || {}
    assign_image(blog, :cover_image, raw[:cover_image]) if raw.key?(:cover_image)
    assign_content_translations(blog, raw[:translations] || {}, fields: TRANSLATION_FIELDS, images: TRANSLATION_IMAGES)
    blog.save
  end

  def display_name(blog)
    blog.translation&.title || blog.slug.presence || "Blog post"
  end

  def blog_row(blog)
    translation = blog.translation
    {
      id: blog.id,
      slug: blog.slug,
      name: translation&.name,
      title: translation&.title,
      is_active: blog.is_active,
      cover_image: image_prop(blog.cover_image),
      languages: blog.blog_translations.filter_map { |t| Language.ids_by_code.key(t.language_id) },
      updated_at: blog.updated_at
    }
  end

  def form_props(blog)
    {
      blog: {
        id: blog.id,
        slug: blog.slug.to_s,
        is_active: blog.is_active,
        cover_image: image_prop(blog.cover_image),
        name: blog.persisted? ? display_name(blog) : nil
      },
      translations: content_translations_props(blog, fields: TRANSLATION_FIELDS, images: TRANSLATION_IMAGES)
    }
  end
end

module Api
  module V1
    module Admin
      class CoursesController < BaseController
        def index
          render json: { courses: CatalogCourse.includes(:catalog_category, :catalog_lessons).order(created_at: :desc).map(&:as_catalog_json) }
        end

        def create
          course = CatalogCourse.new(course_params.except(:lessons))
          course.created_by = current_user
          course.slug = course.title.to_s.parameterize if course.slug.blank?
          assign_lessons(course) if course_params.key?(:lessons)
          course.save!
          render json: { course: course.as_catalog_json }, status: :created
        end

        def update
          course = CatalogCourse.find(params[:id])
          course.transaction do
            course.assign_attributes(course_params.except(:lessons))
            if course_params.key?(:lessons)
              course.catalog_lessons.destroy_all
              assign_lessons(course)
            end
            course.save!
          end
          render json: { course: course.as_catalog_json }
        end

        private

        def course_params
          params.require(:course).permit(:title, :slug, :summary, :description, :level, :hours, :image_url, :status, :catalog_category_id, lessons: %i[title summary])
        end

        def assign_lessons(course)
          course_params[:lessons].each_with_index do |lesson, position|
            course.catalog_lessons.build(title: lesson[:title], summary: lesson[:summary], position: position + 1)
          end
        end
      end
    end
  end
end

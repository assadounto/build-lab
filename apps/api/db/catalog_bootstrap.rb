module CatalogBootstrap
  def self.load!
    data = JSON.parse(File.read(Rails.root.join("db/catalog_bootstrap.json")))
    data.fetch("categories").each do |name|
      CatalogCategory.find_or_create_by!(slug: name.parameterize) { |category| category.name = name }
    end
    data.fetch("projects").each do |item|
      next if CatalogProject.exists?(slug: item.fetch("slug"))
      category = CatalogCategory.find_by!(slug: item.fetch("category").parameterize)
      CatalogProject.create!(slug: item.fetch("slug"), title: item.fetch("title"), summary: item.fetch("description"),
                             description: item.fetch("brief").fetch("concept"), level: item.fetch("level"),
                             format: item.fetch("type"), duration: item.fetch("duration"), image_url: item.fetch("image"),
                             status: "published", catalog_category: category, brief: item.fetch("brief"))
    end
    data.fetch("courses").each do |item|
      next if CatalogCourse.exists?(slug: item.fetch("slug"))
      category = CatalogCategory.find_by!(slug: item.fetch("field").parameterize)
      course = CatalogCourse.new(slug: item.fetch("slug"), title: item.fetch("title"), summary: item.fetch("description"),
                                 description: item.fetch("description"), level: item.fetch("level"), hours: item.fetch("hours"),
                                 image_url: item.fetch("image"), status: "published", catalog_category: category,
                                 related_project_slug: item.fetch("projectSlug"))
      item.fetch("lessons").each_with_index do |lesson, index|
        course.catalog_lessons.build(title: lesson.fetch("title"), summary: lesson.fetch("summary"), position: index + 1)
      end
      course.save!
    end
  end
end

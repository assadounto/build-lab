class AllowProfessionalProjectLevel < ActiveRecord::Migration[7.2]
  def up
    remove_check_constraint :student_projects, name: "student_projects_valid_level"
    add_check_constraint :student_projects, "level IN ('JHS', 'SHS', 'University', 'Professional')", name: "student_projects_valid_level"
  end

  def down
    remove_check_constraint :student_projects, name: "student_projects_valid_level"
    add_check_constraint :student_projects, "level IN ('JHS', 'SHS', 'University')", name: "student_projects_valid_level"
  end
end

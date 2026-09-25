Rails.application.routes.draw do
  get "/health", to: "health#show"

  namespace :api do
    namespace :v1 do
      post "session", to: "sessions#create"
      delete "session", to: "sessions#destroy"
      get "me", to: "sessions#show"
      post "invitations/accept", to: "invitations#accept"
      resources :schools, only: :index do
        get "members", on: :member, to: "schools#members"
        resources :invitations, only: :create
        resources :classrooms, only: %i[index create]
      end
      resources :classrooms, only: :show do
        resources :enrollments, only: :create
        resources :assignments, only: %i[index create]
        get "progress", on: :member, to: "classrooms#progress"
      end
      resources :projects, only: %i[index create show] do
        resources :milestones, only: %i[update]
        resources :log_entries, only: %i[create]
      end
    end
  end
end
